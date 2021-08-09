## Exactly once stream processing
### Challenge/Issue

How do I make sure I have exactly once processing / delivery?

### Solution

Exactly once processing ensures that one streamed message is processed only once by the system, while exactly once delivery ensures that the result of processing appears only once in the destination systems.

Although Amazon Kinesis Data Streams itself only provides at-least-once, the Amazon Kinesis Flink connector supports exactly-once.

See [Apache Flink documentation](https://ci.apache.org/projects/flink/flink-docs-stable/dev/connectors/guarantees.html) for reference.

Notice that the Elasticsearch connector only provides at-least-once guarantee.
In the case of Elasticsearch, the solution is to provide a consistent document id so that a second copy will overwrite the first one instead of adding an additional entry.


## Use Avro logical types with Amazon Kinesis Data Analytics
### Challenge/Issue

How to use Avro schemas with logical types in Amazon Kinesis Data Analytics.

### Solution

There is a problem in the serialization support in Flink that has been corrected in Flink 1.11.3: <insert link to issue>

The solution is to use Flink version 1.11.3 instead of 1.11.1 when compiling and running it against the Amazon Kinesis Data Analytics environment.
