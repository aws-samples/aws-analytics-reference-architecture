## Choosing the right Amazon S3 buckets design for a Data Lake
### Challenge/Issue

Designing Amazon S3 storage is an important step in the Data Lake project. There are multiple considerations to understand and changing the design afterward can be challenging because of the data volume.
This solution explains the Amazon S3 buckets design (numbers and configurations) used to support to the Data Lake

### Solution

Having multiple buckets provides fine grained capabilities to configure the buckets security, data retention and other options. On the other it adds additional resources to maintain into the solution.

Here is the list of features which are defined at the bucket level:

* [Bucket policy](https://docs.aws.amazon.com/AmazonS3/latest/dev/using-iam-policies.html)
* [Lifecycle configuration](https://docs.aws.amazon.com/AmazonS3/latest/dev/object-lifecycle-mgmt.html)
* [Requester pays](https://docs.aws.amazon.com/AmazonS3/latest/dev/RequesterPaysBuckets.html)

MyStore did a tradeoff between these two considerations and choosed to implement its Data Lake with a multi-layer buckets approach.
The Data Lake is composed of three different buckets, one for each state of the data (raw, cleaned, curated). Currently, all the data from the same layer are sharing the same security, retention and costs requirements.
The solution is extensible if MyStore wants to apply different settings to a subpart of the tables. New buckets can be added, for example, for each level of security.