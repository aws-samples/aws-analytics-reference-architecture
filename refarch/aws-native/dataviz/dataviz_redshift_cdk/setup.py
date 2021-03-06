# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

import setuptools


with open("README.md") as fp:
    long_description = fp.read()


setuptools.setup(
    name="ara_dataviz_redshift",
    version="1.0.0",

    description="The Analytics Reference Architecture CDK app for Redshift Dataviz",
    long_description=long_description,
    long_description_content_type="text/markdown",

    author="author",

    package_dir={"": "ara_dataviz_redshift"},
    packages=setuptools.find_packages(where="ara_dataviz_redshift"),

    install_requires=[
        "aws-cdk.core==1.103.0",
    ],

    python_requires=">=3.8,<3.9",

    classifiers=[
        "Development Status :: 4 - Beta",

        "Intended Audience :: Developers",

        "License :: OSI Approved :: Apache Software License",

        "Programming Language :: JavaScript",
        "Programming Language :: Python :: 3 :: Only",
        "Programming Language :: Python :: 3.6",
        "Programming Language :: Python :: 3.7",
        "Programming Language :: Python :: 3.8",

        "Topic :: Software Development :: Code Generators",
        "Topic :: Utilities",

        "Typing :: Typed",
    ],
)
