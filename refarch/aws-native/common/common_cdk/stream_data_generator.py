# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

from constructs import Construct
from aws_cdk import (
    Aws,
    CustomResource,
    Duration,
    Fn,
    Stack,
    ArnFormat,
    aws_iam as _iam,
    aws_ec2 as _ec2,
    aws_s3 as _s3,
    aws_s3_notifications as _s3_notifications,
    aws_lambda as _lambda,
    aws_emr as _emr,
    aws_dynamodb as _dynamodb,
    aws_events_targets as _events_targets,
    aws_events as _events,
    aws_stepfunctions as _sfn,
    aws_stepfunctions_tasks as _sfn_tasks,
    custom_resources as _custom_resources,
    aws_kms as _kms
)

from common_cdk.auto_empty_bucket import AutoEmptyBucket
from common_cdk.config import (BINARIES_LOCATION, ARA_BUCKET_NAME, BINARIES, DataGenConfig)


class StreamDataGenerator(Construct):

    def __init__(self, scope: Construct, id: str,
                 log_bucket: _s3.Bucket,
                 config_table: _dynamodb.Table,
                 tshirt_size: str,
                 sink_bucket: _s3.Bucket,
                 web_sale_stream: str,
                 web_customer_stream: str,
                 web_customer_address_stream: str,
                 kinesis_key: _kms.Key,
                 vpc: _ec2.Vpc,
                 **kwargs) -> None:

        super().__init__(scope, id, **kwargs)

        stack = Stack.of(self)

        stream_source_bucket = AutoEmptyBucket(
            self, 'StreamSource',
            bucket_name='ara-stream-source-'+Aws.ACCOUNT_ID,
            uuid='95505f50-0276-11eb-adc1-0242ac120002'
        )

        service_role = _iam.Role(
            self, 'StreamEmrServiceRole',
            assumed_by=_iam.ServicePrincipal('elasticmapreduce.amazonaws.com')
        )

        service_role.add_managed_policy(_iam.ManagedPolicy.from_aws_managed_policy_name('service-role/AmazonElasticMapReduceRole'))

        cluster_role = _iam.Role(
            self, 'StreamEmrClusterRole',
            assumed_by=_iam.ServicePrincipal("ec2.amazonaws.com")
        )

        sink_bucket.grant_read_write(cluster_role)
        stream_source_bucket.bucket.grant_read_write(cluster_role)

        _iam.Policy(
            self, 'StreamEmrClusterPolicy',
            statements=[
                _iam.PolicyStatement(
                    actions=[
                        "glue:CreateDatabase",
                        "glue:UpdateDatabase",
                        "glue:DeleteDatabase",
                        "glue:GetDatabase",
                        "glue:GetDatabases",
                        "glue:CreateTable",
                        "glue:UpdateTable",
                        "glue:DeleteTable",
                        "glue:GetTable",
                        "glue:GetTables",
                        "glue:GetTableVersions",
                        "glue:CreatePartition",
                        "glue:BatchCreatePartition",
                        "glue:UpdatePartition",
                        "glue:DeletePartition",
                        "glue:BatchDeletePartition",
                        "glue:GetPartition",
                        "glue:GetPartitions",
                        "glue:BatchGetPartition",
                        "glue:CreateUserDefinedFunction",
                        "glue:UpdateUserDefinedFunction",
                        "glue:DeleteUserDefinedFunction",
                        "glue:GetUserDefinedFunction",
                        "glue:GetUserDefinedFunctions",
                        "cloudwatch:PutMetricData",
                        "dynamodb:ListTables",
                        "s3:HeadBucket",
                        "ec2:Describe*",
                    ],
                    resources=['*']
                ),
                _iam.PolicyStatement(
                    actions=['s3:GetObject'],
                    resources=[
                        'arn:aws:s3:::' + ARA_BUCKET_NAME + BINARIES + DataGenConfig.DSDGEN_INSTALL_SCRIPT,
                        'arn:aws:s3:::' + ARA_BUCKET_NAME + BINARIES + DataGenConfig.JAR_FILE
                    ]
                ),
                _iam.PolicyStatement(
                    actions=['s3:PutObject'],
                    resources=[log_bucket.bucket_arn + "/data-generator/*"]
                ),
            ],
            roles=[cluster_role]
        )

        cluster_role.add_managed_policy(_iam.ManagedPolicy.from_aws_managed_policy_name('AmazonSSMManagedInstanceCore'))

        _iam.CfnInstanceProfile(
            self, 'StreamEmrClusterInstanceProfile',
            roles=[cluster_role.role_name],
            instance_profile_name=cluster_role.role_name
        )

        # Security Groups for the EMR cluster (private subnet)
        # https://docs.aws.amazon.com/emr/latest/ManagementGuide/emr-man-sec-groups.html#emr-sg-elasticmapreduce-master-private
        master_sg = _ec2.SecurityGroup(self, 'ElasticMapReduce-Master-Private', vpc=vpc)
        slave_sg = _ec2.SecurityGroup(self, 'ElasticMapReduce-Slave-Private', vpc=vpc)
        service_sg = _ec2.SecurityGroup(self, 'ElasticMapReduce-ServiceAccess', vpc=vpc, allow_all_outbound=False)

        # Service SG used by the proxy instance
        service_sg.add_ingress_rule(master_sg, _ec2.Port.tcp(9443))
        service_sg.add_egress_rule(master_sg, _ec2.Port.tcp(8443))
        service_sg.add_egress_rule(slave_sg, _ec2.Port.tcp(8443))

        # EMR Master
        master_sg.add_ingress_rule(master_sg, _ec2.Port.all_icmp())
        master_sg.add_ingress_rule(master_sg, _ec2.Port.all_tcp())
        master_sg.add_ingress_rule(master_sg, _ec2.Port.all_udp())
        master_sg.add_ingress_rule(slave_sg, _ec2.Port.all_icmp())
        master_sg.add_ingress_rule(slave_sg, _ec2.Port.all_tcp())
        master_sg.add_ingress_rule(slave_sg, _ec2.Port.all_udp())
        master_sg.add_ingress_rule(service_sg, _ec2.Port.tcp(8443))

        # EMR Slave
        slave_sg.add_ingress_rule(master_sg, _ec2.Port.all_icmp())
        slave_sg.add_ingress_rule(master_sg, _ec2.Port.all_tcp())
        slave_sg.add_ingress_rule(master_sg, _ec2.Port.all_udp())
        slave_sg.add_ingress_rule(slave_sg, _ec2.Port.all_icmp())
        slave_sg.add_ingress_rule(slave_sg, _ec2.Port.all_tcp())
        slave_sg.add_ingress_rule(slave_sg, _ec2.Port.all_udp())
        slave_sg.add_ingress_rule(service_sg, _ec2.Port.tcp(8443))

        with open('common/common_cdk/lambda/datagen_config.py', 'r') as f:
            lambda_source = f.read()

        configure_datagen_function = _lambda.SingletonFunction(
            self, 'StreamConfigureDatagenLambda',
            uuid="a9904dec-01cf-11eb-adc1-0242ac120002",
            runtime=_lambda.Runtime.PYTHON_3_7,
            code=_lambda.Code.from_inline(lambda_source),
            handler='index.handler',
            function_name='stream-datagen-config',
            environment={
                'TABLE_NAME': config_table.table_name,
                'JAR_LOCATION': BINARIES_LOCATION + DataGenConfig.JAR_FILE,
            },
            timeout=Duration.seconds(10)
        )

        configure_datagen_function.role.add_to_policy(
            _iam.PolicyStatement(
                actions=[
                    'dynamodb:GetItem',
                    'dynamodb:PutItem',
                ],
                resources=[config_table.table_arn]
            )
        )

        emr_cluster = _emr.CfnCluster(
            self, 'StreamEmrCluster',
            name="StreamDatagenCluster",
            job_flow_role=cluster_role.role_name,
            service_role=service_role.role_name,
            release_label='emr-5.30.1',
            visible_to_all_users=True,
            log_uri=log_bucket.s3_url_for_object() + "/data-generator",
            applications=[
                _emr.CfnCluster.ApplicationProperty(name='hadoop'),
                _emr.CfnCluster.ApplicationProperty(name='spark')
            ],
            bootstrap_actions=[
                _emr.CfnCluster.BootstrapActionConfigProperty(
                    name="dsdgen-install",
                    script_bootstrap_action=_emr.CfnCluster.ScriptBootstrapActionConfigProperty(
                        path=BINARIES_LOCATION + DataGenConfig.DSDGEN_INSTALL_SCRIPT
                    )
                )
            ],
            instances=_emr.CfnCluster.JobFlowInstancesConfigProperty(
                emr_managed_master_security_group=master_sg.security_group_id,
                emr_managed_slave_security_group=slave_sg.security_group_id,
                service_access_security_group=service_sg.security_group_id,
                ec2_subnet_id=vpc.private_subnets[0].subnet_id,
                core_instance_group=_emr.CfnCluster.InstanceGroupConfigProperty(
                    instance_count=DataGenConfig.BATCH_CLUSTER_SIZE[tshirt_size],
                    instance_type='m5.xlarge'
                ),
                master_instance_group=_emr.CfnCluster.InstanceGroupConfigProperty(
                    instance_count=1,
                    instance_type='m4.large'
                )
            )
        )

        configure_datagen = _sfn_tasks.LambdaInvoke(
            self, "ConfigureDatagenTask",
            lambda_function=configure_datagen_function,
            payload=_sfn.TaskInput.from_text('{'
                                             '"Param": "stream_iterator",'
                                             '"Module": "stream",'
                                             '"SinkBucket": "'+sink_bucket.s3_url_for_object()+'",'
                                             '"Parallelism": "'+str(int(DataGenConfig.STREAM_DATA_SIZE[tshirt_size])*2)+'",'
                                             '"DataSize": "'+DataGenConfig.STREAM_DATA_SIZE[tshirt_size]+'",'
                                             '"TmpBucket": "'+str(stream_source_bucket.bucket.s3_url_for_object())+'"'
                                             '}'),
            result_path='$.Config'
        )

        add_datagen_step = _sfn.CustomState(
            self, 'StreamAddDataGenStep',
            state_json={
                "Type": "Task",
                "Resource": "arn:aws:states:::elasticmapreduce:addStep.sync",
                "Parameters": {
                    "ClusterId.$": "$.Emr.Cluster.Id",
                    "Step": {
                        "Name": "DatagenStep",
                        "ActionOnFailure": "CONTINUE",
                        "HadoopJarStep": {
                            "Jar": "command-runner.jar",
                            "Args.$": "$.Config.Payload.StepParam"
                        }
                    }
                },
                "ResultPath": "$.Step",
                "Next": "StreamUpdateIterator"
            }
        )

        update_iterator = _sfn_tasks.DynamoUpdateItem(
            self, 'StreamUpdateIterator',
            table=config_table,
            key={
                'param': _sfn_tasks.DynamoAttributeValue.from_string('stream_iterator')
            },
            update_expression='SET iterator = if_not_exists(iterator, :start) + :inc',
            expression_attribute_values={
                ":inc": _sfn_tasks.DynamoAttributeValue.from_number(1),
                ":start": _sfn_tasks.DynamoAttributeValue.from_number(0)
            },
            result_path=_sfn.JsonPath.DISCARD
        )

        definition = configure_datagen \
            .next(add_datagen_step) \
            .next(update_iterator)

        datagen_stepfunctions = _sfn.StateMachine(
            self, "StreamDataGenStepFunctions",
            definition=definition,
            timeout=Duration.minutes(30)
        )

        datagen_stepfunctions.add_to_role_policy(
            _iam.PolicyStatement(
                actions=[
                    'elasticmapreduce:AddJobFlowSteps',
                    'elasticmapreduce:DescribeStep'
                ],
                resources=['*']
            )
        )

        step_trigger = _events.Rule(
            self, 'StreamStepTrigger',
            schedule=_events.Schedule.cron(minute='0/10',
                                           hour='*',
                                           month='*',
                                           week_day='*',
                                           year='*')
        )

        step_trigger.add_target(
            _events_targets.SfnStateMachine(
                machine=datagen_stepfunctions,
                input=_events.RuleTargetInput.from_object({"Emr": {"Cluster": {"Id": Fn.ref(emr_cluster.logical_id)}}})
            )
        )

        with open('common/common_cdk/lambda/stepfunctions_trigger.py', 'r') as f:
            lambda_source = f.read()

        stepfunctions_trigger_lambda = _lambda.SingletonFunction(
            self, 'StreamStepFunctionsTriggerLambda',
            uuid="cf042246-01d0-11eb-adc1-0242ac120002",
            runtime=_lambda.Runtime.PYTHON_3_7,
            code=_lambda.Code.from_inline(lambda_source),
            handler='index.handler',
            function_name='stepfunctions-stream-datagen-trigger'
        )

        stepfunctions_trigger_lambda.role.add_to_policy(
            _iam.PolicyStatement(
                actions=["states:StartExecution"],
                resources=['*']
            )
        )

        trigger_step_lambda_provider = _custom_resources.Provider(
            self, 'StreamStepFunctionsTriggerLambdaProvider',
            on_event_handler=stepfunctions_trigger_lambda
        )

        CustomResource(
            self, 'StreamStepFunctionsTrigger',
            service_token=trigger_step_lambda_provider.service_token,
            properties={
                "stepArn": datagen_stepfunctions.state_machine_arn
            }
        )

        with open('common/common_cdk/lambda/stream_generator.py', 'r') as f:
            lambda_source = f.read()

        sale_stream_generator_lambda = _lambda.Function(
            scope=self,
            id='WebSaleStreamGenerator',
            runtime=_lambda.Runtime.PYTHON_3_7,
            memory_size=2048,
            timeout=Duration.minutes(15),
            code=_lambda.Code.from_inline(lambda_source),
            handler='index.lambda_handler',
            environment={
                'REGION': Aws.REGION,
                'STREAM_NAME': web_sale_stream
            }
        )

        stream_source_bucket.bucket.add_event_notification(
            _s3.EventType.OBJECT_CREATED,
            _s3_notifications.LambdaDestination(sale_stream_generator_lambda),
            _s3.NotificationKeyFilter(prefix='sale', suffix='csv')

        )

        sale_stream_generator_lambda.add_to_role_policy(
            _iam.PolicyStatement(
                actions=[
                    "s3:DeleteObject",
                    "s3:GetObject",
                    "s3:ListBucket",
                ],
                resources=[
                    stream_source_bucket.bucket.bucket_arn+'/*',
                    stream_source_bucket.bucket.bucket_arn
                ]
            )
        )

        sale_stream_generator_lambda.add_to_role_policy(
            _iam.PolicyStatement(
                actions=[
                    "kinesis:PutRecords"
                ],
                resources=[stack.format_arn(service='kinesis', resource='stream', resource_name=web_sale_stream)]
            )
        )

        sale_stream_generator_lambda.add_to_role_policy(
            _iam.PolicyStatement(
                actions=['kms:GenerateDataKey'],
                resources=[stack.format_arn(service='kms', resource='key', arn_format=ArnFormat.SLASH_RESOURCE_NAME, resource_name=kinesis_key.key_id)]
            )
        )

        customer_stream_generator_lambda = _lambda.Function(
            scope=self,
            id='WebCustomerStreamGenerator',
            runtime=_lambda.Runtime.PYTHON_3_7,
            memory_size=2048,
            timeout=Duration.minutes(15),
            code=_lambda.Code.from_inline(lambda_source),
            handler='index.lambda_handler',
            environment={
                'REGION': Aws.REGION,
                'STREAM_NAME': web_customer_stream
            }
        )

        stream_source_bucket.bucket.add_event_notification(
            _s3.EventType.OBJECT_CREATED,
            _s3_notifications.LambdaDestination(customer_stream_generator_lambda),
            _s3.NotificationKeyFilter(prefix='customer', suffix='csv')
        )

        customer_stream_generator_lambda.add_to_role_policy(
            _iam.PolicyStatement(
                actions=[
                    "s3:DeleteObject",
                    "s3:GetObject",
                    "s3:ListBucket",
                ],
                resources=[
                    stream_source_bucket.bucket.bucket_arn+'/*',
                    stream_source_bucket.bucket.bucket_arn
                ]
            )
        )

        customer_stream_generator_lambda.add_to_role_policy(
            _iam.PolicyStatement(
                actions=[
                    "kinesis:PutRecords"
                ],
                resources=[stack.format_arn(service='kinesis', resource='stream', resource_name=web_customer_stream)]
            )
        )

        customer_stream_generator_lambda.add_to_role_policy(
            _iam.PolicyStatement(
                actions=['kms:GenerateDataKey'],
                resources=[stack.format_arn(service='kms', resource='key', arn_format=ArnFormat.SLASH_RESOURCE_NAME, resource_name=kinesis_key.key_id)]
            )
        )

        address_stream_generator_lambda = _lambda.Function(
            scope=self,
            id='WebCustomerAddressStreamGenerator',
            runtime=_lambda.Runtime.PYTHON_3_7,
            memory_size=2048,
            timeout=Duration.minutes(15),
            code=_lambda.Code.from_inline(lambda_source),
            handler='index.lambda_handler',
            environment={
                'REGION': Aws.REGION,
                'STREAM_NAME': web_customer_address_stream
            }
        )

        stream_source_bucket.bucket.add_event_notification(
            _s3.EventType.OBJECT_CREATED,
            _s3_notifications.LambdaDestination(address_stream_generator_lambda),
            _s3.NotificationKeyFilter(prefix='address', suffix='csv')
        )

        address_stream_generator_lambda.add_to_role_policy(
            _iam.PolicyStatement(
                actions=[
                    "s3:DeleteObject",
                    "s3:GetObject",
                    "s3:ListBucket",
                ],
                resources=[
                    stream_source_bucket.bucket.bucket_arn+'/*',
                    stream_source_bucket.bucket.bucket_arn
                ]
            )
        )

        address_stream_generator_lambda.add_to_role_policy(
            _iam.PolicyStatement(
                actions=[
                    "kinesis:PutRecords"
                ],
                resources=[stack.format_arn(service='kinesis', resource='stream', resource_name=web_customer_address_stream)]
            )
        )

        address_stream_generator_lambda.add_to_role_policy(
            _iam.PolicyStatement(
                actions=['kms:GenerateDataKey'],
                resources=[stack.format_arn(service='kms', resource='key', arn_format=ArnFormat.SLASH_RESOURCE_NAME, resource_name=kinesis_key.key_id)]
            )
        )
