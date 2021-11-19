# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

from aws_cdk.custom_resources import Provider
import json
import common.common_cdk.config as _config

from aws_cdk.aws_iam import PolicyStatement
from aws_cdk.core import CustomResource, Stack
from aws_cdk.aws_secretsmanager import Secret, SecretStringGenerator

from aws_cdk import (
    core as core,
    aws_ec2 as _ec2,
    aws_lambda as _lambda,
    aws_glue as _glue,
    aws_redshift as _redshift
)

import aws_analytics_reference_architecture

import subprocess

import os


class RedshiftAdminCdkStack(core.Construct):
    SQL_SCRIPT_DIR = '/sql/'

    @property
    def etl_user_secret(self):
        return self.__etl_user_secret

    @property
    def quicksight_secret_arn(self):
        return self.__quicksight_user_secret.secret_arn

    def __init__(self,
                 scope: core.Construct,
                 id: str,
                 vpc: _ec2.Vpc,
                 redshift_secret_arn: str,
                 lambda_sg: _ec2.SecurityGroup,
                 clean_glue_db: _glue.Database,
                 redshift_role_arn: str,
                 redshift_cluster_endpoint: _redshift.Endpoint,
                 redshift_cluster: _redshift.Cluster,
                 **kwargs) -> None:
        super().__init__(scope, id, **kwargs)

        self.__vpc = vpc
        self.__redshift_secret_arn = redshift_secret_arn
        self.__lambda_sg = lambda_sg
        self.__clean_glue_db = clean_glue_db
        self.__redshift_role_arn = redshift_role_arn

        stack = Stack.of(self)

        # Generate secrets for Redshift users
        generator = SecretStringGenerator(exclude_characters="'", exclude_punctuation=True)

        # self.__etl_user_secret = Secret(
        #     scope=self, id='ETLUserSecret',
        #     description="ETL user Redshift",
        #     generate_secret_string=SecretStringGenerator(
        #         exclude_characters="'",
        #         exclude_punctuation=True,
        #         generate_string_key="password",
        #         secret_string_template=json.dumps(
        #             {
        #                 'username': _config.Redshift.ETL_USER,
        #                 'dbname': _config.Redshift.DATABASE,
        #                 'host': redshift_cluster_endpoint.hostname,
        #                 'port': core.Token.as_string(redshift_cluster_endpoint.port)
        #             }
        #         )
        #     )
        # )
        # self.__dataengineer_user_secret = Secret(
        #     scope=self, id='DataEngineerUserSecret',
        #     description="DataEngineer user Redshift",
        #     generate_secret_string=SecretStringGenerator(
        #         exclude_characters="'",
        #         exclude_punctuation=True,
        #         generate_string_key="password",
        #         secret_string_template=json.dumps(
        #             {
        #                 'username': _config.Redshift.DATA_ENGINEER_USER,
        #                 'dbname': _config.Redshift.DATABASE,
        #                 'host': redshift_cluster_endpoint.hostname,
        #                 'port': core.Token.as_string(redshift_cluster_endpoint.port)
        #             }
        #         )
        #     ))

        # self.__quicksight_user_secret = Secret(
        #     scope=self, id='DatavizUserSecret',
        #     description="Quicksight user Redshift",
        #     generate_secret_string=SecretStringGenerator(
        #         exclude_characters="'",
        #         exclude_punctuation=True,
        #         generate_string_key="password",
        #         secret_string_template=json.dumps(
        #             {
        #                 'username': _config.Redshift.DATAVIZ_USER,
        #                 'dbname': _config.Redshift.DATABASE,
        #                 'host': redshift_cluster_endpoint.hostname,
        #                 'port': core.Token.as_string(redshift_cluster_endpoint.port)
        #             }
        #         )
        #     ))

        self.__subnets_selection = _ec2.SubnetSelection(availability_zones=None, one_per_az=None,
                                                       subnet_group_name=None, subnet_name=None,
                                                       subnets=None, subnet_type=_ec2.SubnetType.PRIVATE)

        # Use the following command line to generate the python dependencies layer content
        # pip3 install -t lambda-layer/python/lib/python3.8/site-packages -r lambda/requirements.txt
        # Build the lambda layer assets
        subprocess.call(
            ['pip3', 'install', '-t', 'dwh/dwh_cdk/bootstrap_lambda_layer/python/lib/python3.8/site-packages', '-r',
             'dwh/dwh_cdk/bootstrap_lambda/requirements.txt', '--platform', 'manylinux1_x86_64', '--only-binary=:all:',
             '--upgrade'])

        requirements_layer = _lambda.LayerVersion(scope=self,
                                                  id='PythonRequirementsTemplate',
                                                  code=_lambda.Code.from_asset(
                                                      'dwh/dwh_cdk/bootstrap_lambda_layer'),
                                                  compatible_runtimes=[_lambda.Runtime.PYTHON_3_8])

        # This lambda function will run SQL commands to setup Redshift users and tables

        data_engineer = _redshift.User(self, "dataEngineer",
            cluster=redshift_cluster,
            database_name=_config.RedshiftDeploy.REDSHIFT_DB_NAME,
            username='data_engineer')
        dataviz = _redshift.User(self, "dataviz",
            cluster=redshift_cluster,
            database_name=_config.RedshiftDeploy.REDSHIFT_DB_NAME,
            username='dataviz')
        etl = _redshift.User(self, "etl",
            cluster=redshift_cluster,
            database_name=_config.RedshiftDeploy.REDSHIFT_DB_NAME,
            username='etl')
            

        redshift_migration = aws_analytics_reference_architecture.FlywayRunner(scope=self,
                                                          id='BootstrapNewGen', 
                                                          migration_scripts_folder_absolute_path=os.path.abspath('dwh/redshift/sql'),
                                                          cluster=redshift_cluster, 
                                                          vpc=self.__vpc, 
                                                          database_name=_config.RedshiftDeploy.REDSHIFT_DB_NAME,
                                                        )

        bootstrap_function_name = 'RedshiftBootstrap'
        register_template_lambda = _lambda.Function(scope=self,
                                                    id='RegisterTemplate',
                                                    runtime=_lambda.Runtime.PYTHON_3_8,
                                                    code=_lambda.Code.from_asset(
                                                        'dwh/dwh_cdk/bootstrap_lambda'),
                                                    handler='redshift_setup.handler',
                                                    environment={
                                                        'SQL_SCRIPT_LOCATION': _config.BINARIES_LOCATION + self.SQL_SCRIPT_DIR,
                                                        'SECRET_ARN': self.__redshift_secret_arn,
                                                        'SQL_SCRIPT_FILES': _config.RedshiftDeploy.SQL_SCRIPT_FILES,
                                                        'GLUE_DATABASE': self.__clean_glue_db.database_name,
                                                        'REDSHIFT_IAM_ROLE': self.__redshift_role_arn
                                                    },
                                                    layers=[requirements_layer],
                                                    timeout=core.Duration.minutes(3),
                                                    vpc=self.__vpc,
                                                    vpc_subnets=self.__subnets_selection,
                                                    security_group=self.__lambda_sg,
                                                    function_name=bootstrap_function_name,
                                                    memory_size=256
                                                    )


        redshift_migration.node.add_dependency(data_engineer)
        redshift_migration.node.add_dependency(dataviz)
        redshift_migration.node.add_dependency(etl)
        register_template_lambda.node.add_dependency(redshift_migration)

        lambda_role = register_template_lambda.role

        lambda_role.add_to_policy(PolicyStatement(
            actions=['secretsmanager:GetResourcePolicy', 'secretsmanager:GetSecretValue',
                     'secretsmanager:DescribeSecret', 'secretsmanager:ListSecretVersionIds'],
            resources=[stack.format_arn(service='secretsmanager', resource='*')]))

        lambda_role.add_to_policy(PolicyStatement(actions=['logs:CreateLogGroup'],
                                                  resources=[stack.format_arn(service='logs', resource='*')]))
        lambda_role.add_to_policy(PolicyStatement(actions=['logs:CreateLogStream', 'logs:PutLogEvents'],
                                                  resources=[stack.format_arn(service='logs', resource='log_group',
                                                                              resource_name='/aws/lambda/' + bootstrap_function_name + ':*')]))

        artifacts_bucket_arn = 'arn:aws:s3:::' + _config.ARA_BUCKET.replace("s3://", "")
        lambda_role.add_to_policy(PolicyStatement(actions=['s3:GetObject', 's3:GetObjectVersion'],
                                                  resources=[artifacts_bucket_arn,
                                                             artifacts_bucket_arn + '/binaries/*']))

        bootstrap_lambda_provider = Provider(scope=self,
                                             id='BootstrapLambdaProvider',
                                             on_event_handler=register_template_lambda)
        CustomResource(scope=self,
                      id='ExecuteRegisterTemplate',
                      service_token=bootstrap_lambda_provider.service_token)

        self.__secrets_manager_vpc_endpoint_sg = _ec2.SecurityGroup(self, id="secrets_manager_vpc_endpoint-sg",
                                                                   vpc=self.__vpc, allow_all_outbound=None,
                                                                   description=None,
                                                                   security_group_name="secrets-manager-vpc_endpoint-sg")

        self.__secrets_manager_vpc_endpoint_sg.add_ingress_rule(self.__lambda_sg,
                                                                _ec2.Port.all_tcp()
                                                                )

        self.__security_groups_list = [self.__secrets_manager_vpc_endpoint_sg]

        self.__endpoint_service_name = 'com.amazonaws.%s.secretsmanager' % stack.region
        # Create VPC endpoint for SecretsManager
        secrets_manager_vpc_endpoint = _ec2.InterfaceVpcEndpoint(stack, "Secretsmanager VPC Endpoint",
                                                                vpc=self.__vpc,
                                                                service=_ec2.InterfaceVpcEndpointService(
                                                                    self.__endpoint_service_name, 443),
                                                                subnets=self.__subnets_selection,
                                                                security_groups=self.__security_groups_list
                                                                )
