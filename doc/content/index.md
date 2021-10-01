The AWS Analytics Reference Architecture is a set of modular analytics solutions put together as an end-to-end example.
It can be used by AWS customers to help them implement analytics solution on AWS platform. The example solution regroups AWS best practices for designing, implementing and operating analytics platform through different purpose-built patterns answering common requirements and solving common challenges.

The AWS Analytics Reference Architecture explain the journey of a fake company, MyStore Inc., into implementing its data platform solution.

## Business story

MyStore Inc. is a US based retailer that operates in multi-channels with an e-commerce platform and physical stores across the United States.

The company’s e-commerce platform has recently been implemented with cloud native solutions and purpose built databases.
Website sales and customers data are well documented and available in real time.
Physical stores are all still operating with on premise solutions based on legacy technologies inherited from various acquisitions. Data is available in batch and in different formats

## MyStore's project

MyStore is building an analytics platform on top of AWS to answer various identified business cases, following the AWS well architected pillars:

* Security
* Operational excellence
* Cost optimization
* Performance efficiency
* Reliability

MyStore is looking for solutions which will remove the manual processes and provide the business with a consistent view of sales and customers across the different channels (web, catalogs and stores)

MyStore also wants to improve its analytics platform in the future with AI/ML predictions and recommendations like product recommendation for online customers/mailing for all customers, sales forecasts per channel/region/store, demand forecasts per store

## Content

MyStore provides both code and documentation about its analytics platform:
 
 * Documentation is available on this website and decomposed into two different parts:
    * The [high level design](high-level-design/architecture.md) describes the overall data platform implemented by MyStore, and the different components involved. This is the recommended entry point to discover the solution
    * The [analytics solutions](solutions/data-lake.md) provide fine-grained solutions to the challenges MyStore met during the project. These technical patterns can help you choose the right solution for common challenges in analytics area
 * Code is publicly available [here](https://github.com/aws-samples/aws-analytics-reference-architecture) and can be reused as an example for other analytics platform implementations (it should not be reused as-is in production). The code can be deployed in an AWS account following the [getting started](https://github.com/aws-samples/aws-analytics-reference-architecture/blob/main/README.md#getting-started---deploying-the-project) guide

