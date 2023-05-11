# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

from constructs import Construct
from aws_cdk import (
    CfnOutput,
    aws_ec2 as ec2,
    aws_iam as iam,
)

class QuickSightVpcConnectionReqs(Construct):

    @property
    def security_group_id(self):
        return self.__quicksight_sg_id
    
    @property
    def vpc_role(self):
        return self.__quicksight_vpc_role

    def __init__(
            self,
            scope: Construct,
            id: str,
            vpc,
            redshift_security_group_id,
            quicksight_security_group_name: str,
            **kwargs):

        super().__init__(scope, id, **kwargs)

        quicksight_sg = ec2.SecurityGroup(self, id=quicksight_security_group_name, vpc=vpc, description="Security group for QuickSight VPC connection", security_group_name=quicksight_security_group_name, allow_all_outbound=False)
        self.__quicksight_sg_id = quicksight_sg.security_group_id
        redshift_sg = ec2.SecurityGroup.from_security_group_id(self, 'redshift-sg-edit', security_group_id=redshift_security_group_id)

        quicksight_sg.add_ingress_rule(redshift_sg, ec2.Port.all_tcp())
        quicksight_sg.add_egress_rule(redshift_sg, ec2.Port.tcp(5439))

        redshift_sg.add_ingress_rule(quicksight_sg, ec2.Port.tcp(5439))
        redshift_sg.add_egress_rule(quicksight_sg, ec2.Port.all_tcp())

        self.__quicksight_vpc_role = iam.Role(self, 'quicksight-vpc-role', assumed_by=iam.ServicePrincipal('quicksight.amazonaws.com'))
        self.__quicksight_vpc_role.add_to_policy(iam.PolicyStatement(
            actions=[
                "ec2:CreateNetworkInterface",
                "ec2:ModifyNetworkInterfaceAttribute",
                "ec2:DeleteNetworkInterface",
                "ec2:DescribeSubnets",
                "ec2:DescribeSecurityGroups"
            ],
            resources=['*']
        )
        )


