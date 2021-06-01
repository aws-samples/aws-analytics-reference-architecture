# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

from aws_cdk import (
    core,
    aws_ec2 as ec2
)

class QuickSightVpcConnectionReqs(core.Construct):

    @property
    def security_group_id(self):
        return self.__quicksight_sg_id

    def __init__(
            self,
            scope: core.Construct,
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



