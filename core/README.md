# AWS Analytics Reference Architecture

The AWS Analytics Reference Architecture is a set of analytics solutions put together as end-to-end examples.
It regroups AWS best practices for designing, implementing, and operating analytics platforms through different purpose-built patterns, handling common requirements, and solving customers' challenges.

This project is composed of:
 * Reusable core components exposed in an AWS CDK (Cloud Development Kit) library currently available in [Typescript]() and [Python](). This library contains high level AWS CDK constructs that can be used to quickly provision analytics solutions in demos, prototypes, proof of concepts and end-to-end reference architectures. 
 * Reference architectures consumming the reusable components to demonstrate end-to-end examples in a business context. Currently, the AWS native reference architecture is available.

This documentation explains how to get started with the core components of the AWS Analytics Reference Architecture.

## Getting started

- [AWS Analytics Reference Architecture](#aws-analytics-reference-architecture)
  - [Getting started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Initialization (in Python)](#initialization-in-python)
    - [Development](#development)
    - [Deployment](#deployment)
    - [Cleanup](#cleanup)
  - [API Reference](#api-reference)
  - [Contributing](#contributing)
- [License Summary](#license-summary)

### Prerequisites

1. [Create an AWS account](https://aws.amazon.com/premiumsupport/knowledge-center/create-and-activate-aws-account/)
2. The core components can be deployed in any AWS region
3. Install the following components with the specified version on the machine from which the deployment will be executed:
    1. Python [3.8-3.9.2] or Typescript
    2. AWS CDK: Please refer to the [Getting started](https://docs.aws.amazon.com/cdk/latest/guide/getting_started.html) guide.


### Initialization (in Python)

1. Initialize a new AWS CDK application in Python and use a virtual environment to install dependencies

```bash
mkdir my_demo
cd my_demo
cdk init app --language python
python3 -m venv .env
source .venv/bin/activate
```

2. Add the AWS Analytics Reference Architecture library in the dependencies of your project. Update **setup.py** 

```bash
    install_requires=[
        "aws-cdk.core==1.130.0",
        "aws-analytics-reference-architecture==1.8.4",
    ],
```
3. Install The Packages via **pip**

```bash
python -m pip install -r requirements.txt
```

### Development

1. Import the AWS Analytics Reference Architecture in your code in **my_demo/my_demo_stack.py**

```bash
import aws_analytics_reference_architecture as ara
```

2. Now you can use all the constructs available from the core components library to quickly provision resources in your AWS CDK stack. For example:

* The DataLakeStorage to provision a full set of pre-configured Amazon S3 Bucket for a data lake

```bash
        # Create a new DataLakeStorage with Raw, Clean and Transform buckets configured with data lake best practices
        storage = ara.DataLakeStorage (self,"storage")     
```

* The DataLakeCatalog to provision a full set of AWS Glue databases for registring tables in your data lake

```bash
        # Create a new DataLakeCatalog with Raw, Clean and Transform databases
        catalog = ara.DataLakeCatalog (self,"catalog")     
```

* The DataGenerator to generate live data in the data lake from a pre-configured retail dataset

```bash
        # Generate the Sales Data
        sales_data = ara.DataGenerator(
            scope = self, 
            id = 'sale-data', 
            dataset = ara.Dataset.RETAIL_1_GB_STORE_SALE, 
            sink_arn = storage.raw_bucket.bucket_arn, 
            frequency = 120
        )
```

```bash
        # Generate the Customer Data
        customer_data = ara.DataGenerator(
            scope = self, 
            id = 'customer-data', 
            dataset = ara.Dataset.RETAIL_1_GB_CUSTOMER, 
            sink_arn = storage.raw_bucket.bucket_arn, 
            frequency = 120
        )
```

* Additionally, the library provides some helpers to quickly run demos:

```bash
        # Configure defaults for Athena console
        ara.AthenaDefaultSetup(
            scope = self,
            id = 'defaultSetup'
        )
```

```bash
        # Configure a default role for AWS Glue jobs
        ara.SingletonGlueDefaultRole.get_or_create(self)
```

### Deployment

1. Bootstrap AWS CDK in your region (here **eu-west-1**). It will provision resources required to deploy AWS CDK applications

```bash
export ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
export AWS_REGION=eu-west-1
cdk bootstrap aws://$ACCOUNT_ID/eu-west-1
```
2. Deploy the AWS CDK application

```bash
cdk deploy
```

The time to deploy the application is depending on the constructs you are using

### Cleanup

Delete the AWS CDK application

```bash
cdk destroy
```

## API Reference

More contructs, helpers and datasets are available in the AWS Analytics Reference Architecture. See the full API specification [here](https://constructs.dev/packages/aws-analytics-reference-architecture/v/1.8.4?lang=python)

## Contributing

Please refer to the [contributing guidelines](../CONTRIBUTING.md) and [contributing FAQ](../CONTRIB_FAQ.md) for details.

# License Summary

The documentation is made available under the Creative Commons Attribution-ShareAlike 4.0 International License. See the LICENSE file.

The sample code within this documentation is made available under the MIT-0 license. See the LICENSE-SAMPLECODE file.