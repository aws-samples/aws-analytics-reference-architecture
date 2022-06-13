# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

from constructs import Construct
from aws_cdk import (
    Aws,
    CustomResource,
    aws_lambda as _lambda,
    aws_iam as _iam,
    custom_resources as _custom_resources
)


class AutoEmptySecurityGroup(Construct):

    def __init__(self, scope: Construct, id: str, secgroup_name: str, **kwargs):
        super().__init__(scope, id, **kwargs)

        with open('common/common_cdk/lambda/empty_security_group.py', 'r') as f:
            lambda_source = f.read()

        # lambda utils to empty security group before deletion
        empty_secgroup_lambda = _lambda.SingletonFunction(self, 'EmptySecurityGroupLambda',
                                                          uuid="dfs3k8730-4ee1-11e8-9c2d-fdfs65dfsc",
                                                          runtime=_lambda.Runtime.PYTHON_3_7,
                                                          code=_lambda.Code.from_inline(lambda_source),
                                                          handler='index.handler',
                                                          function_name='ara-auto-empty-secgroup'
                                                          )

        empty_secgroup_lambda_role = _iam.Role(
            self, 'AutoEmptyBucketLambdaRole',
            assumed_by=_iam.ServicePrincipal('lambda.amazonaws.com')
        )

        empty_secgroup_lambda_role.add_to_policy(
            _iam.PolicyStatement(
                actions=[
                    'ec2:RevokeSecurityGroupIngress',
                    'ec2:RevokeSecurityGroupEgress'
                ],
                resources=['arn:aws:ec2::'+Aws.ACCOUNT_ID+':security-group/'+secgroup_name]
            )
        )

        empty_secgroup_lambda_provider = _custom_resources.Provider(
            self, 'EmptyBucketLambdaProvider',
            on_event_handler=empty_secgroup_lambda
        )

        CustomResource(
            self, 'EmptyBucketCustomResource',
            service_token=empty_secgroup_lambda_provider.service_token,
            properties={
                "secgroup_name": secgroup_name
            }
        )

