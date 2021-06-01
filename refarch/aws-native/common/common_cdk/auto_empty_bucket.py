# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

from aws_cdk import (
    core,
    aws_s3 as _s3,
    aws_lambda as _lambda,
    aws_cloudformation as _cfn,
    aws_iam as _iam,
    custom_resources as _custom_resources
)


class AutoEmptyBucket(core.Construct):

    @property
    def bucket(self):
        return self.__bucket

    def __init__(self, scope: core.Construct, id: str, bucket_name: str, uuid: str, **kwargs):
        super().__init__(scope, id, **kwargs)

        bucket_storage = _s3.LifecycleRule(transitions=[
            _s3.Transition(storage_class=_s3.StorageClass.INTELLIGENT_TIERING, transition_after=core.Duration.days(1))
        ])

        self.__bucket = _s3.Bucket(self, 'S3Bucket', bucket_name=bucket_name, removal_policy=core.RemovalPolicy.DESTROY,
                                   encryption=_s3.BucketEncryption.KMS_MANAGED, lifecycle_rules=[bucket_storage])

        with open('common/common_cdk/lambda/empty_bucket.py', 'r') as f:
            lambda_source = f.read()

        empty_bucket_lambda = _lambda.SingletonFunction(
            self, 'EmptyBucketLambda',
            uuid=uuid,
            runtime=_lambda.Runtime.PYTHON_3_7,
            code=_lambda.Code.inline(lambda_source),
            handler='index.handler',
            timeout=core.Duration.minutes(15)
        )

        empty_bucket_lambda.role.add_to_policy(
            _iam.PolicyStatement(
                actions=[
                    's3:DeleteObject',
                    's3:DeleteObjectVersion',
                    's3:ListBucketVersions',
                    's3:ListBucket'
                ],
                resources=[
                    self.__bucket.bucket_arn+'/*',
                    self.__bucket.bucket_arn
                ]
            )
        )

        empty_bucket_lambda_provider = _custom_resources.Provider(
            self, 'EmptyBucketLambdaProvider',
            on_event_handler=empty_bucket_lambda
        )

        custom_resource = core.CustomResource(
            self, 'EmptyBucketCustomResource',
            service_token=empty_bucket_lambda_provider.service_token,
            properties={
                "bucket_name": self.__bucket.bucket_name
            }
        )

        custom_resource.node.add_dependency(self.__bucket)
