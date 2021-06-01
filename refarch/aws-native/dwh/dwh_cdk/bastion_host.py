# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

import aws_cdk.aws_ec2 as ec2
from aws_cdk import (
    core,
    aws_iam as iam,
    aws_autoscaling as _autoscaling,
    aws_events as _events,
    aws_events_targets as _events_targets,
    aws_iam as _iam,
    aws_lambda as _lambda,
    aws_route53 as _route53,
    aws_elasticloadbalancingv2 as _elbv2
)

from cdk_ec2_key_pair import KeyPair
import common.common_cdk.config as _config
from aws_cdk.core import Stack


class RedshiftBastion(core.Construct):
    '''the BastionHost may be used to access resources in a Private network using SSM. For example it is required for
    operational support of Redshift '''

    @property
    def bastion_keypair_secret(self):
        return self.__key.prefix + self.__key.key_pair_name

    @property
    def bastion_sg(self):
        return self._bastion_sg

    @property
    def bastion_dns(self):
        return self.__bastion_nlb.load_balancer_dns_name

    def __init__(self, scope: core.Construct, id: str, vpc, **kwargs) -> None:
        super().__init__(scope, id, **kwargs)

        stack = Stack.of(self)

        self.__key = KeyPair(self, "bastion-keypair",
                             name=_config.Redshift.BASTION_HOST_KEY_PAIR_NAME,
                             description="Key Pair to connect to bastion host",
                             resource_prefix="ara-redshift-bastion"
                             )

        self._bastion_sg = ec2.SecurityGroup(self, id="bastion-sg", vpc=vpc, allow_all_outbound=None,
                                             description=None, security_group_name="bastion-sg")

        # a proper ip address needs to be configured before stack deployment
        if _config.Redshift.LOCAL_IP is not None:
            self._bastion_sg.add_ingress_rule(ec2.Peer.ipv4(_config.Redshift.LOCAL_IP), ec2.Port.tcp(22))

        # Instance Role and SSM Managed Policy
        self._role = iam.Role(self, "InstanceSSM", assumed_by=iam.ServicePrincipal("ec2.amazonaws.com"),
                              role_name='bastion-host-role')

        self._role.add_to_policy(iam.PolicyStatement(
            actions=['secretsmanager:GetResourcePolicy', 'secretsmanager:GetSecretValue',
                     'secretsmanager:DescribeSecret', 'secretsmanager:ListSecretVersionIds'],
            resources=[stack.format_arn(service='secretsmanager',
                                        resource='secret:ec2-private-key/'+_config.Redshift.BASTION_HOST_KEY_PAIR_NAME+'*')]))

        self._role.add_managed_policy(_iam.ManagedPolicy.from_aws_managed_policy_name('AmazonSSMManagedInstanceCore'))

        bastion_asg = _autoscaling.AutoScalingGroup(
            self, 'bastion-autoscaling',
            instance_type=ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE3, ec2.InstanceSize.NANO),
            machine_image=ec2.AmazonLinuxImage(),
            vpc=vpc,
            key_name=_config.Redshift.BASTION_HOST_KEY_PAIR_NAME,
            role=self._role,
            security_group=self._bastion_sg,
            vpc_subnets=ec2.SubnetSelection(availability_zones=None, one_per_az=None,
                                            subnet_group_name=None, subnet_name=None,
                                            subnets=None, subnet_type=ec2.SubnetType.PRIVATE),
            cooldown=core.Duration.minutes(1),
            min_capacity=1,
            max_capacity=3,
            spot_price="0.005"
        )

        self.__bastion_nlb = _elbv2.NetworkLoadBalancer(
            self, 'bastion_elb',
            vpc=vpc,
            internet_facing=True,
            vpc_subnets=ec2.SubnetSelection(availability_zones=None, one_per_az=None,
                                            subnet_group_name=None, subnet_name=None,
                                            subnets=None, subnet_type=ec2.SubnetType.PUBLIC)
        )

        listener = self.__bastion_nlb.add_listener("Listener", port=22)
        listener.add_targets("Target", port=22, targets=[bastion_asg])
