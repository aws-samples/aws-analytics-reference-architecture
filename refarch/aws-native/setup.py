import setuptools


with open("README.md") as fp:
    long_description = fp.read()


setuptools.setup(
    name="analytics-reference-architecture",
    version="2.4.12",

    description="The Analytics Reference Architecture CDK app",
    long_description=long_description,
    long_description_content_type="text/markdown",

    author="author",

    package_dir={"": "common"},
    packages=setuptools.find_packages(where="common"),

    install_requires=[
        "aws_analytics_reference_architecture==2.4.12",
        "aws-cdk-lib>=2.26.0",
        "aws-cdk.aws-glue-alpha>=2.26.0.a0"
        "aws-cdk.aws-redshift-alpha>=2.26.0.a0"
        "constructs>=10.0.0",
        "cdk_ec2_key_pair==3.3.1"
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
