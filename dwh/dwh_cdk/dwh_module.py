# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

from aws_cdk import (
    core,
    aws_ec2 as ec2,
    aws_s3 as s3,
    aws_glue as _glue
)
from dwh.dwh_cdk.bastion_host import RedshiftBastion
from dwh.dwh_cdk.dwh_loader import DwhLoader
from dwh.dwh_cdk.redshift import RedshiftCdkStack
from dwh.dwh_cdk.redshift_admin import RedshiftAdminCdkStack


class DwhModule(core.NestedStack):

    @property
    def redshift_sg_id(self):
        return self.__redshift.redshift_sg.security_group_id

    @property
    def bastion_keypair_secret(self):
        return self.__bastion.bastion_keypair_secret

    @property
    def quicksight_redshift_secret_arn(self):
        return self.__redshift_admin.quicksight_secret_arn

    @property
    def bastion_dns(self):
        return self.__bastion.bastion_dns

    @property
    def redshift_endpoint(self):
        return self.__redshift.redshift_endpoint

    def __init__(self,
                 scope: core.Construct,
                 id: str,
                 vpc: ec2.IVpc,
                 clean_bucket: s3.Bucket,
                 clean_glue_db: _glue.Database,
                 **kwargs) -> None:

        super().__init__(scope, id, **kwargs)

        self.__bastion = RedshiftBastion(self, "Bastion", vpc=vpc)

        self.__vpc = vpc

        self.__redshift_glue_sg = ec2.SecurityGroup(self, id="redshift-glue-sg", vpc=self.__vpc,
                                                    allow_all_outbound=None,
                                                    description='Allow glue to access redshift', security_group_name="redshift-glue-sg")

        self.__redshift_glue_sg.add_ingress_rule(self.__redshift_glue_sg, ec2.Port.all_traffic())

        self.__bastion_sg = self.__bastion.bastion_sg
        self.__clean_bucket = clean_bucket
        self.__clean_glue_db = clean_glue_db
        self.__redshift = RedshiftCdkStack(self, "RedshiftClusterCreate", vpc=self.__vpc, bastion_sg=self.__bastion_sg, glue_sg=self.__redshift_glue_sg, clean_bucket=self.__clean_bucket)
        self.__redshift_sg_id = self.__redshift.redshift_sg.security_group_id
        self.__redshift_secret_arn = self.__redshift.redshift_secret_arn

        self.__redshift_admin = RedshiftAdminCdkStack(self, "RedshiftAdmin",
                                                      vpc=self.__vpc,
                                                      redshift_secret_arn=self.__redshift_secret_arn,
                                                      lambda_sg=self.__redshift.lambda_sg,
                                                      clean_glue_db=self.__clean_glue_db,
                                                      redshift_role_arn=self.__redshift.redshift_role_arn,
                                                      redshift_cluster_endpoint=self.__redshift.cluster.cluster_endpoint)

        self.__dwh_loader = DwhLoader(
            self, 'DwhLoader',
            redshift_cluster_name=self.__redshift.cluster.cluster_name,
            user_secret=self.__redshift_admin.etl_user_secret
        )

        core.Tags.of(self).add('module-name', 'dwh')
