
# AWS Analytics Reference Architecture

The AWS Analytics Reference Architecture is a set of analytics solutions put together as end-to-end examples.
It regroups AWS best practices for designing, implementing, and operating analytics platforms through different purpose-built patterns, handling common requirements, and solving customers' challenges.

This project is composed of:
 * Reusable core components exposed in an AWS CDK (Cloud Development Kit) library currently available in [Typescript](https://www.npmjs.com/package/aws-analytics-reference-architecture) and [Python](https://pypi.org/project/aws-analytics-reference-architecture/). This library contains [AWS CDK constructs](https://constructs.dev/packages/aws-analytics-reference-architecture/v/1.15.0?lang=python) that can be used to quickly provision analytics solutions in demos, prototypes, proof of concepts and end-to-end reference architectures. 
 * Reference architectures consumming the reusable components to demonstrate end-to-end examples in a business context. Currently, the [AWS native reference architecture](https://aws-samples.github.io/aws-analytics-reference-architecture/) is available.


This repository contains the codebase and getting started instructions for:
 * The [core components](core/README.md): how to consume the AWS CDK constructs to create new end-to-end examples
 * The [reference architectures](refarch/README.md): how to provision end-to-end examples

## Contributing

Please refer to the [contributing guidelines](CONTRIBUTING.md) and [contributing FAQ](CONTRIB_FAQ.md) for details.

# License Summary

The documentation is made available under the Creative Commons Attribution-ShareAlike 4.0 International License. See the LICENSE file.

The sample code within this documentation is made available under the MIT-0 license. See the LICENSE-SAMPLECODE file.
