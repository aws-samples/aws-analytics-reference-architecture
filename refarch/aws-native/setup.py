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
        "aws-analytics-reference-architecture==1.15.0",
        "aws-cdk.core==1.134.0",
        "aws-cdk.aws-s3==1.134.0",
        "aws-cdk.aws-glue==1.134.0",
        "aws-cdk.aws_ec2==1.134.0",
        "aws-cdk.aws_iam==1.134.0",
        "aws-cdk.aws_s3_deployment==1.134.0",
        "aws-cdk.aws_lambda==1.134.0",
        "aws-cdk.aws_cloudformation==1.134.0",
        "aws_cdk.aws_redshift==1.134.0",
        "aws-cdk.aws_ec2==1.134.0",
        "aws-cdk.aws_secretsmanager==1.134.0",
        "aws-cdk.aws-kinesisanalytics==1.134.0",
        "aws-cdk.aws-elasticsearch==1.134.0",
        "aws-cdk.custom-resources==1.134.0",
        "aws-cdk.aws-cognito==1.134.0",
        "aws-cdk.aws-kinesis==1.134.0",
        "aws-cdk.aws_cloudtrail==1.134.0",
        "aws_cdk.aws_stepfunctions==1.134.0",
        "aws_cdk.aws_stepfunctions_tasks==1.134.0",
        "aws_cdk.aws_s3_notifications==1.134.0",
        "aws_cdk.aws_dynamodb==1.134.0",
        "aws_cdk.aws_events==1.134.0",
        "aws_cdk.aws_events_targets==1.134.0",
        "aws_cdk.aws_emr==1.134.0",
        "aws_cdk.aws_batch==1.134.0",
        "aws_cdk.aws_autoscaling==1.134.0",
        "aws_cdk.aws_elasticloadbalancingv2==1.134.0",
        "aws_cdk.pipelines==1.134.0",
        "cdk_ec2_key_pair==2.2.1"
    ],

    # python_requires=">=3.8",

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
