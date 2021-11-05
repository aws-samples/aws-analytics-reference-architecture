import setuptools


with open("README.md") as fp:
    long_description = fp.read()


setuptools.setup(
    name="analytics-reference-architecture",
    version="1.0.0",

    description="The Analytics Reference Architecture CDK app",
    long_description=long_description,
    long_description_content_type="text/markdown",

    author="author",

    package_dir={"": "common"},
    packages=setuptools.find_packages(where="common"),

    install_requires=[
        "aws-cdk.core==1.103.0",
        "aws-cdk.aws-s3==1.103.0",
        "aws-cdk.aws-glue==1.103.0",
        "aws-cdk.aws_ec2==1.103.0",
        "aws-cdk.aws_iam==1.103.0",
        "aws-cdk.aws_s3_deployment==1.103.0",
        "aws-cdk.aws_lambda==1.103.0",
        "aws-cdk.aws_cloudformation==1.103.0",
        "aws_cdk.aws_redshift==1.103.0",
        "aws-cdk.aws_ec2==1.103.0",
        "aws-cdk.aws_secretsmanager==1.103.0",
        "aws-cdk.aws-kinesisanalytics==1.103.0",
        "aws-cdk.aws-elasticsearch==1.103.0",
        "aws-cdk.custom-resources==1.103.0",
        "aws-cdk.aws-cognito==1.103.0",
        "aws-cdk.aws-kinesis==1.103.0",
        "aws-cdk.aws_cloudtrail==1.103.0",
        "aws_cdk.aws_stepfunctions==1.103.0",
        "aws_cdk.aws_stepfunctions_tasks==1.103.0",
        "aws_cdk.aws_s3_notifications==1.103.0",
        "aws_cdk.aws_dynamodb==1.103.0",
        "aws_cdk.aws_events==1.103.0",
        "aws_cdk.aws_events_targets==1.103.0",
        "aws_cdk.aws_emr==1.103.0",
        "aws_cdk.aws_batch==1.103.0",
        "aws_cdk.aws_autoscaling==1.103.0",
        "aws_cdk.aws_elasticloadbalancingv2==1.103.0",
        "cdk_ec2_key_pair"
    ],

    python_requires=">=3.8",

    classifiers=[
        "Development Status :: 4 - Beta",

        "Intended Audience :: Developers",

        "License :: OSI Approved :: Apache Software License",

        "Programming Language :: JavaScript",
        "Programming Language :: Python :: 3 :: Only",
        "Programming Language :: Python :: 3.8",

        "Topic :: Software Development :: Code Generators",
        "Topic :: Utilities",

        "Typing :: Typed",
    ],
)
