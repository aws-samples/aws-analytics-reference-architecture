# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

from aws_cdk import (
    aws_redshift as redshift,
    core as core,
    aws_iam as iam,
    aws_s3 as s3,
    aws_ec2 as ec2
)

from aws_cdk.aws_redshift import ClusterType, NodeType
from aws_cdk.core import RemovalPolicy
import common.common_cdk.config as _config


class RedshiftCdkStack(core.Construct):

    @property
    def redshift_sg(self):
        return self.__redshift_sg

    @property
    def redshift_secret_arn(self):
        return self.__redshift_cluster.secret.secret_arn

    @property
    def lambda_sg(self):
        return self.__lambda_sg

    @property
    def redshift_endpoint(self):
        return self.__redshift_endpoint

    @property
    def redshift_role_arn(self):
        return self.__s3role.role_arn

    @property
    def cluster(self):
        return self.__redshift_cluster

    def __init__(self,
                 scope: core.Construct,
                 id: str,
                 vpc,
                 bastion_sg,
                 glue_sg,
                 clean_bucket: s3.Bucket,
                 **kwargs) -> None:
        super().__init__(scope, id, **kwargs)

        self.__vpc = vpc
        self.__clean_bucket = clean_bucket

        self.__glue_sg = glue_sg

        self.__redshift_sg = ec2.SecurityGroup(self, id="redshift-sg", vpc=self.__vpc, allow_all_outbound=None,
                                               description=None, security_group_name="redshift-sg")

        self.__lambda_sg = ec2.SecurityGroup(self, id="redshift-lambda-sg", vpc=vpc, allow_all_outbound=None,
                                             description=None, security_group_name="redshift-lambda-sg")

        self.__redshift_sg.add_ingress_rule(bastion_sg,
                                            ec2.Port.tcp(5439)
                                            )

        self.__redshift_sg.add_ingress_rule(self.__lambda_sg,
                                            ec2.Port.tcp(5439)
                                            )

        self.__redshift_sg.add_ingress_rule(self.__glue_sg, ec2.Port.tcp(5439))

        self.__security_groups_list = [self.__redshift_sg]

        self.__master_user = {'master_username': "dwh_user"}

        self.__subnets_selection = ec2.SubnetSelection(availability_zones=None, one_per_az=None,
                                                       subnet_group_name=None, subnet_name=None,
                                                       subnets=None, subnet_type=ec2.SubnetType.PRIVATE)

        # Create role that is used by the Redshift to read data from clean bucket
        self.__s3role = iam.Role(
            self,
            "RedshiftClean",
            assumed_by=iam.ServicePrincipal("redshift.amazonaws.com")
        )

        self.__s3role.add_to_principal_policy(iam.PolicyStatement(actions=['s3:GetObject',
                                                                         's3:ListBucket',
                                                                         's3:GetBucketLocation',
                                                                         's3:ListMultipartUploadParts',
                                                                         's3:ListBucketMultipartUploads'
                                                                         ],
                                                                resources=[self.__clean_bucket.arn_for_objects('*'),
                                                                           self.__clean_bucket.bucket_arn]
                                                                ))

        self.__s3role.add_to_principal_policy(iam.PolicyStatement(actions=['glue:CreateDatabase',
                                                                         'glue:CreateDatabase',
                                                                         'glue:DeleteDatabase',
                                                                         'glue:GetDatabase',
                                                                         'glue:GetDatabases',
                                                                         'glue:UpdateDatabase',
                                                                         'glue:CreateTable',
                                                                         'glue:DeleteTable',
                                                                         'glue:BatchDeleteTable',
                                                                         'glue:UpdateTable',
                                                                         'glue:GetTable',
                                                                         'glue:GetTables',
                                                                         'glue:BatchCreatePartition',
                                                                         'glue:CreatePartition',
                                                                         'glue:DeletePartition',
                                                                         'glue:BatchDeletePartition',
                                                                         'glue:UpdatePartition',
                                                                         'glue:GetPartition',
                                                                         'glue:GetPartitions',
                                                                         'glue:BatchGetPartition'
                                                                         ],
                                                                resources=['*']
                                                                ))

        self.__roles_list = [self.__s3role]

        self.__redshift_cluster = redshift.Cluster(self, "redshift", master_user=self.__master_user,
                                                   vpc=vpc,
                                                   cluster_name="ara-cdk-cluster",
                                                   cluster_type=ClusterType.MULTI_NODE,
                                                   default_database_name=_config.RedshiftDeploy.REDSHIFT_DB_NAME,
                                                   encrypted=None,
                                                   encryption_key=None,
                                                   logging_bucket=None,
                                                   logging_key_prefix=None,
                                                   node_type=NodeType.DC2_LARGE,
                                                   number_of_nodes=2,
                                                   parameter_group=None,
                                                   port=None,
                                                   preferred_maintenance_window=None,
                                                   removal_policy=RemovalPolicy.DESTROY,
                                                   roles=self.__roles_list,
                                                   security_groups=self.__security_groups_list,
                                                   vpc_subnets=self.__subnets_selection,
                                                   )

        self.__redshift_endpoint = self.__redshift_cluster.cluster_endpoint




