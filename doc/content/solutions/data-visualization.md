## Direct Query vs. Caching with SPICE

### Challenge/Issue
How do I know when to use SPICE or direct query for my data set?

### Solution
When creating an Amazon QuickSight data set you have the option to directly query the underlying data source, such as Amazon Athena, or load the data into Amazon QuickSight’s Super-fast, In-memory Calculation Engine (SPICE). Using SPICE can save time and money 

1. As the further calculations and queries needed by data and business analysts are processing locally instead of waiting for results from direct query on the external data source.
2. As it reduces the overhead on the data lake or data warehouse by allowing the data stored in SPICE to be reused multiple times. 

At the time of writing the following row and volume limits apply to the use of SPICE for a dataset:

* For Standard edition, 25 million (25,000,000) rows or 25 GB for each dataset
* For Enterprise edition, 250 million (250,000,000) rows or 500 GB for each dataset

Within the Data Visualisation module direct query is used for both data sources so that as new streaming data arrives it is available immediately for visualisation within Amazon QuickSight. 

The decision to use SPICE will depend up on a couple of primary factors:

1. The volume of data required for visualisation
2. The rate at which the data needs to be refreshed

## Data Volume
If the volume of data required for analysis is larger than the limit listed above then a direct query will be required in order to visualise the data. In this scenario, one pattern that can be followed is to create two datasets in Amazon QuickSight:

1. A pre-aggregate dataset, that is below the SPICE limit, to provide summary visualisations.
2. An un-aggregated dataset, that is configured for direct query, the summary data can then be used to drill down to a filtered subset of the un-aggregated data.
> Note: To eliminate the direct query from being made to the full un-aggregated dataset, it is recommended to keep the visual representation of detailed un-aggregated dataset i.e. the `detailed visualization` in a separate sheet from the visual representation of the pre-aggregated dataset i.e. the `summary visualization`.
> 
> Hence, to use [Navigation Action](https://docs.aws.amazon.com/quicksight/latest/user/quicksight-actions.html) to keep passing filters from the `summary visualization` to the `detailed visualization`.

## Data Refresh Rate
If the data needs to be refreshed more than approximately once per hour then you will need to direct query the underlying data source. 

*SPICE Refresh*
### Challenge/Issue
How can I best optimise my use of SPICE, and the underlying data sources?

### Solution
SPICE data can be refreshed manually, via the Amazon QuickSight APIs or on a schedule, for example daily, weekly or monthly. Where possible the recommended best practice is to refresh SPICE only when necessary, this ensures the underlying data sources are used efficiently by only querying the data when an update is required. This can be achieved using an event driven approach, with an example shown in this [blog post](https://aws.amazon.com/blogs/big-data/event-driven-refresh-of-spice-datasets-in-amazon-quicksight/) . 


## Amazon Redshift Private Connectivity from Amazon QuickSight

### Challenge/Issue
How to connect Amazon QuickSight to a private Amazon Redshift cluster?

### Solution
Best practice is for Amazon Redshift clusters to not be publicly accessible, all access should be tightly controlled. In order to connect Amazon QuickSight to an Amazon Redshift cluster in a private subnet a VPC Connection can be created within Amazon QuickSight to the VPC. Security groups can be used in order to control the network communication. This [article](https://aws.amazon.com/premiumsupport/knowledge-center/quicksight-redshift-private-connection/) provides step-by-step instructions that detail how this can be configured.

## Sharing an Amazon QuickSight Analysis or Dashboard between Accounts

### Challenge/Issue
How to share Amazon QuickSight analysis between AWS accounts?

### Solution
In order to share either an analysis or dashboard between Amazon QuickSight instances in separate AWS Accounts, a template can be created in the source account. This template can then be used to create a new template, analysis or dashboard in the target account. This [article](https://aws.amazon.com/premiumsupport/knowledge-center/quicksight-cross-account-template/) provides a step-by-step example of how this can be configured.


