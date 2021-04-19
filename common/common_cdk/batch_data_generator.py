# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

from aws_cdk import (
    aws_stepfunctions as _sfn,
    aws_stepfunctions_tasks as _sfn_tasks,
    aws_lambda as _lambda,
    aws_iam as _iam,
    aws_s3 as _s3,
    aws_dynamodb as _dynamodb,
    aws_events as _events,
    aws_events_targets as _events_targets,
    custom_resources as _custom_resources,
    aws_ec2 as _ec2,
    core
)
from common.common_cdk.config import (BINARIES_LOCATION, ARA_BUCKET_NAME, BINARIES, DataGenConfig)


class BatchDataGenerator(core.Construct):

    def __init__(self, scope: core.Construct, id: str,
                 log_bucket: _s3.Bucket,
                 config_table: _dynamodb.Table,
                 tshirt_size: str,
                 sink_bucket: _s3.Bucket,
                 vpc: _ec2.Vpc,
                 **kwargs) -> None:

        super().__init__(scope, id, **kwargs)

        service_role = _iam.Role(
            self, 'BatchEmrServiceRole',
            assumed_by=_iam.ServicePrincipal('elasticmapreduce.amazonaws.com')
        )

        service_role.add_managed_policy(_iam.ManagedPolicy.from_aws_managed_policy_name('service-role/AmazonElasticMapReduceRole'))

        cluster_role = _iam.Role(
            self, 'BatchEmrClusterRole',
            assumed_by=_iam.ServicePrincipal("ec2.amazonaws.com")
        )

        _iam.Policy(
            self, 'BatchEmrClusterPolicy',
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
                _iam.PolicyStatement(
                    actions=[
                        "s3:AbortMultipartUpload",
                        "s3:CreateBucket",
                        "s3:DeleteObject",
                        "s3:GetBucketVersioning",
                        "s3:GetObject",
                        "s3:GetObjectTagging",
                        "s3:GetObjectVersion",
                        "s3:ListBucket",
                        "s3:ListBucketMultipartUploads",
                        "s3:ListBucketVersions",
                        "s3:ListMultipartUploadParts",
                        "s3:PutBucketVersioning",
                        "s3:PutObject",
                        "s3:PutObjectTagging"
                    ],
                    resources=[
                        sink_bucket.bucket_arn + '/*',
                        sink_bucket.bucket_arn

                    ]
                )
            ],
            roles=[cluster_role]
        )

        cluster_role.add_managed_policy(_iam.ManagedPolicy.from_aws_managed_policy_name('AmazonSSMManagedInstanceCore'))

        _iam.CfnInstanceProfile(
            self, 'BatchEmrClusterInstanceProfile',
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
            self, 'BatchConfigureDatagenLambda',
            uuid="58a9a222-ff07-11ea-adc1-0242ac120002",
            runtime=_lambda.Runtime.PYTHON_3_7,
            code=_lambda.Code.inline(lambda_source),
            handler='index.handler',
            function_name='datagen-config',
            environment={
                'TABLE_NAME': config_table.table_name,
                'JAR_LOCATION': BINARIES_LOCATION + DataGenConfig.JAR_FILE,
            },
            timeout=core.Duration.seconds(10)
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

        terminate_cluster = _sfn_tasks.EmrTerminateCluster(
            self, 'BatchDeleteCluster',
            cluster_id=_sfn.TaskInput.from_data_at("$.Emr.Cluster.Id").value,
            integration_pattern=_sfn.IntegrationPattern.RUN_JOB,
        )

        terminate_cluster_error = _sfn_tasks.EmrTerminateCluster(
            self, 'BatchDeleteClusterError',
            cluster_id=_sfn.TaskInput.from_data_at("$.Emr.Cluster.Id").value,
            integration_pattern=_sfn.IntegrationPattern.RUN_JOB,
        ).next(_sfn.Fail(self, 'StepFailure'))

        create_cluster = _sfn_tasks.EmrCreateCluster(
            self, "BatchCreateEMRCluster",
            name="BatchDatagenCluster",
            result_path="$.Emr",
            release_label='emr-5.30.1',
            log_uri=log_bucket.s3_url_for_object() + "/data-generator",
            cluster_role=cluster_role,
            service_role=service_role,
            bootstrap_actions=[
                _sfn_tasks.EmrCreateCluster.BootstrapActionConfigProperty(
                    name="dsdgen-install",
                    script_bootstrap_action=_sfn_tasks.EmrCreateCluster.ScriptBootstrapActionConfigProperty(
                        path=BINARIES_LOCATION + DataGenConfig.DSDGEN_INSTALL_SCRIPT,
                    )
                )
            ],
            applications=[
                _sfn_tasks.EmrCreateCluster.ApplicationConfigProperty(
                    name="spark"
                ),
                _sfn_tasks.EmrCreateCluster.ApplicationConfigProperty(
                    name="hadoop"
                )
            ],
            instances=_sfn_tasks.EmrCreateCluster.InstancesConfigProperty(
                emr_managed_master_security_group=master_sg.security_group_id,
                emr_managed_slave_security_group=slave_sg.security_group_id,
                service_access_security_group=service_sg.security_group_id,
                ec2_subnet_ids=vpc.select_subnets().subnet_ids,
                instance_fleets=[
                    _sfn_tasks.EmrCreateCluster.InstanceFleetConfigProperty(
                        instance_fleet_type=_sfn_tasks.EmrCreateCluster.InstanceRoleType.MASTER,
                        instance_type_configs=[
                            _sfn_tasks.EmrCreateCluster.InstanceTypeConfigProperty(
                                instance_type='m5.xlarge',
                                weighted_capacity=1
                            ),
                            _sfn_tasks.EmrCreateCluster.InstanceTypeConfigProperty(
                                instance_type='m5a.xlarge',
                                weighted_capacity=1
                            ),
                            _sfn_tasks.EmrCreateCluster.InstanceTypeConfigProperty(
                                instance_type='m4.xlarge',
                                weighted_capacity=1
                            ),
                            _sfn_tasks.EmrCreateCluster.InstanceTypeConfigProperty(
                                instance_type='m5d.xlarge',
                                weighted_capacity=1
                            ),
                        ],
                        launch_specifications=_sfn_tasks.EmrCreateCluster.InstanceFleetProvisioningSpecificationsProperty(
                            spot_specification=_sfn_tasks.EmrCreateCluster.SpotProvisioningSpecificationProperty(
                                timeout_action=_sfn_tasks.EmrCreateCluster.SpotTimeoutAction.SWITCH_TO_ON_DEMAND,
                                timeout_duration_minutes=5
                            )
                        ),
                        target_on_demand_capacity=0,
                        target_spot_capacity=1
                    ),
                    _sfn_tasks.EmrCreateCluster.InstanceFleetConfigProperty(
                        instance_fleet_type=_sfn_tasks.EmrCreateCluster.InstanceRoleType.CORE,
                        instance_type_configs=[
                            _sfn_tasks.EmrCreateCluster.InstanceTypeConfigProperty(
                                instance_type='m5.xlarge',
                                weighted_capacity=1
                            ),
                            _sfn_tasks.EmrCreateCluster.InstanceTypeConfigProperty(
                                instance_type='m5.2xlarge',
                                weighted_capacity=2
                            ),
                            _sfn_tasks.EmrCreateCluster.InstanceTypeConfigProperty(
                                instance_type='m5a.xlarge',
                                weighted_capacity=1
                            ),
                            _sfn_tasks.EmrCreateCluster.InstanceTypeConfigProperty(
                                instance_type='m5a.2xlarge',
                                weighted_capacity=2
                            ),
                            _sfn_tasks.EmrCreateCluster.InstanceTypeConfigProperty(
                                instance_type='m4.xlarge',
                                weighted_capacity=1
                            )
                        ],
                        launch_specifications=_sfn_tasks.EmrCreateCluster.InstanceFleetProvisioningSpecificationsProperty(
                            spot_specification=_sfn_tasks.EmrCreateCluster.SpotProvisioningSpecificationProperty(
                                timeout_action=_sfn_tasks.EmrCreateCluster.SpotTimeoutAction.SWITCH_TO_ON_DEMAND,
                                timeout_duration_minutes=5
                            )
                        ),
                        target_on_demand_capacity=0,
                        target_spot_capacity=DataGenConfig.BATCH_CLUSTER_SIZE[tshirt_size]

                    )
                ]
            )
        ).add_catch(handler=terminate_cluster_error, result_path="$.error")

        configure_datagen = _sfn_tasks.LambdaInvoke(
            self, "BatchConfigureDatagenTask",
            lambda_function=configure_datagen_function,
            payload=_sfn.TaskInput.from_text('{'
                                             '"Param": "batch_iterator",'
                                             '"Module": "batch",'
                                             '"SinkBucket": "'+sink_bucket.s3_url_for_object()+'",'
                                             '"Parallelism": "'+str(int(DataGenConfig.BATCH_DATA_SIZE[tshirt_size])*2)+'",'
                                             '"DataSize": "'+DataGenConfig.BATCH_DATA_SIZE[tshirt_size]+'",'
                                             '"TmpBucket": "fake-bucket"'
                                             '}'),
            result_path='$.Config'
        ).add_catch(handler=terminate_cluster_error, result_path="$.error")

        add_datagen_step = _sfn.CustomState(
            self, 'BatchAddDataGenStep',
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
                "Next": "BatchUpdateIterator",
                "Catch": [
                    {
                        "ErrorEquals": ["States.ALL"],
                        "Next": "BatchDeleteClusterError",
                        "ResultPath": "$.error"
                    }
                ]
            }
        )

        update_iterator = _sfn_tasks.DynamoUpdateItem(
            self, 'BatchUpdateIterator',
            table=config_table,
            key={
                'param': _sfn_tasks.DynamoAttributeValue.from_string('batch_iterator')
            },
            update_expression='SET iterator = if_not_exists(iterator, :start) + :inc',
            expression_attribute_values={
                ":inc": _sfn_tasks.DynamoAttributeValue.from_number(1),
                ":start": _sfn_tasks.DynamoAttributeValue.from_number(0)
            },
            result_path=_sfn.JsonPath.DISCARD
        )

        definition = configure_datagen \
            .next(create_cluster) \
            .next(add_datagen_step) \
            .next(update_iterator) \
            .next(terminate_cluster)

        datagen_stepfunctions = _sfn.StateMachine(
            self, "BatchDataGenStepFunctions",
            definition=definition,
            timeout=core.Duration.minutes(30)
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
            self, 'BatchSteptrigger',
            schedule=_events.Schedule.cron(minute='0/30',
                                           hour='*',
                                           month='*',
                                           week_day='*',
                                           year='*')
        )

        step_trigger.add_target(_events_targets.SfnStateMachine(machine=datagen_stepfunctions))

        with open('common/common_cdk/lambda/stepfunctions_trigger.py', 'r') as f:
            lambda_source = f.read()

        stepfunctions_trigger_lambda = _lambda.SingletonFunction(
            self, 'BatchStepFunctionsTriggerLambda',
            uuid="9597f6f2-f840-11ea-adc1-0242ac120002",
            runtime=_lambda.Runtime.PYTHON_3_7,
            code=_lambda.Code.inline(lambda_source),
            handler='index.handler',
            function_name='stepfunctions-batch-datagen-trigger'
        )

        stepfunctions_trigger_lambda.role.add_to_policy(
            _iam.PolicyStatement(
                actions=["states:StartExecution"],
                resources=['*']
            )
        )

        trigger_step_lambda_provider = _custom_resources.Provider(
            self, 'StepFunctionsTriggerLambdaProvider',
            on_event_handler=stepfunctions_trigger_lambda
        )

        core.CustomResource(
            self, 'StepFunctionsTrigger',
            service_token=trigger_step_lambda_provider.service_token,
            properties={
                "stepArn": datagen_stepfunctions.state_machine_arn
            }
        )

        # terminate clusters
        with open('common/common_cdk/lambda/stepfunctions_terminate_emr.py', 'r') as f:
            lambda_source = f.read()

        sfn_terminate = _lambda.SingletonFunction(
            self, 'StepFuncTerminateBatch',
            uuid='58a9a422-ff07-11ea-adc1-0242ac120002',
            runtime=_lambda.Runtime.PYTHON_3_7,
            code=_lambda.Code.inline(lambda_source),
            handler='index.handler',
            timeout=core.Duration.minutes(5)
        )

        sfn_terminate.role.add_to_policy(
            _iam.PolicyStatement(
                actions=[
                    'elasticmapreduce:ListClusters',
                    'elasticmapreduce:TerminateJobFlows',
                    'states:ListStateMachines',
                    'states:ListExecutions',
                    'states:StopExecution'
                ],
                resources=['*']
            )
        )

        sfn_terminate_provider = _custom_resources.Provider(
            self, 'StepFuncTerminateBatchLambdaProvider',
            on_event_handler=sfn_terminate
        )

        core.CustomResource(
            self, 'StepFuncTerminateBatchCustomResource',
            service_token=sfn_terminate_provider.service_token,
            properties={
                "state_machine": 'BatchDatagen'
            })
