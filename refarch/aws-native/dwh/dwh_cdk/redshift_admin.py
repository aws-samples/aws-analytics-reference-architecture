# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

from aws_cdk.custom_resources import Provider
import json
import common.common_cdk.config as _config

from aws_cdk.aws_iam import PolicyStatement
from aws_cdk.core import CfnOutput, CustomResource, Stack

from aws_cdk import (
    core as core,
    aws_ec2 as _ec2,
    aws_lambda as _lambda,
    aws_glue as _glue,
    aws_redshift as _redshift
)

import aws_analytics_reference_architecture

import os

class RedshiftAdminCdkStack(core.Construct):
    SQL_SCRIPT_DIR = '/sql/'

    @property
    def etl_user_secret(self):
        return self.etl.node.find_child(id='Secret')

    @property
    def __quicksight_user_secret(self):
        return self.dataviz.node.find_child(id='Secret')

    @property
    def quicksight_secret_arn(self):
        return self.__quicksight_user_secret.secret_arn

    def __init__(self,
                 scope: core.Construct,
                 id: str,
                 vpc: _ec2.Vpc,
                 lambda_sg: _ec2.SecurityGroup,
                 clean_glue_db: _glue.Database,
                 redshift_role_arn: str,
                 redshift_cluster: _redshift.Cluster,
                 **kwargs) -> None:
        super().__init__(scope, id, **kwargs)

        self.__vpc = vpc
        self.__lambda_sg = lambda_sg
        self.__clean_glue_db = clean_glue_db
        self.__redshift_role_arn = redshift_role_arn

        stack = Stack.of(self)

        self.__subnets_selection = _ec2.SubnetSelection(availability_zones=None, one_per_az=None,
                                                       subnet_group_name=None, subnet_name=None,
                                                       subnets=None, subnet_type=_ec2.SubnetType.PRIVATE)


        # This lambda function will run SQL commands to setup Redshift users and tables

        self.data_engineer = _redshift.User(self, "dataEngineer",
            cluster=redshift_cluster,
            database_name=_config.RedshiftDeploy.REDSHIFT_DB_NAME,
            username='data_engineer')
        self.dataviz = _redshift.User(self, "dataviz",
            cluster=redshift_cluster,
            database_name=_config.RedshiftDeploy.REDSHIFT_DB_NAME,
            username='dataviz')
        self.etl = _redshift.User(self, "etl",
            cluster=redshift_cluster,
            database_name=_config.RedshiftDeploy.REDSHIFT_DB_NAME,
            username='etl')
            

        redshift_migration = aws_analytics_reference_architecture.FlywayRunner(scope=self,
                                                          id='Bootstrap', 
                                                          migration_scripts_folder_absolute_path=os.path.abspath('dwh/redshift/sql'),
                                                          cluster=redshift_cluster, 
                                                          vpc=self.__vpc, 
                                                          database_name=_config.RedshiftDeploy.REDSHIFT_DB_NAME,
                                                          replace_dictionary={'GLUE_DATABASE': self.__clean_glue_db.database_name, 'REDSHIFT_IAM_ROLE': self.__redshift_role_arn}
                                                        )

        CfnOutput(self, "RedshiftSchemaVersion", value=redshift_migration.runner.get_att_string('version'))
  

        redshift_migration.node.add_dependency(self.data_engineer)
        redshift_migration.node.add_dependency(self.dataviz)
        redshift_migration.node.add_dependency(self.etl)
        
        
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
