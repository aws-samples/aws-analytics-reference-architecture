// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import org.apache.log4j.{Level, Logger}
import org.apache.spark.sql.functions.{struct, to_json}
import org.apache.spark.sql.streaming.StreamingQuery
import org.apache.spark.sql.{Row, SparkSession}

import scala.util.{Failure, Success, Try}

object StreamGenerator {

  val logger: Logger = Logger.getLogger(this.getClass)

  def main(args: Array[String]) {

    logger.setLevel(Level.INFO)

    // check arguments
    val usage = """
                  |Usage :
                  |TpcGenerator.jar
                  |name: the name of the dataset to stream
                  |tmpDir: the transient local path (on HDFS) to store raw TPCDS data before transforming for modules
                  |targetStream: the stream name where to write final data (Kinesis stream)
                  |parallelism: the number of Spark partitions to use
                  |streamCheckpoint: the path to Spark structured streaming checkpoint (for stream module)
                  |region: the region where the application is deployed
                  |"""

    val param = Try(StreamGenParam(
      args(0),
      args(1),
      args(2),
      args(3).toInt,
      args(4),
      args(5)
    ))

    param match {
      case Success(param) =>
        lazy val session =
          SparkSession.builder
            .config("spark.sql.session.timeZone", "UTC")
            .config("spark.scheduler.mode", "FAIR")
            .config("spark.sql.streaming.checkpointLocation", param.streamCheckpoint)
            .config("spark.sql.shuffle.partitions", param.parallelism)
            .appName("stream-generator-" + param.targetStream)
            .getOrCreate()
        runJob(session, param)
        session.stop()
      case Failure(f) =>
        println(f)
        println(usage)
        System.exit(1)
    }
  }

  def stopStreamQuery(query: StreamingQuery) {
    while (query.isActive)
    {
      if (!query.status.isDataAvailable
        && !query.status.isTriggerActive
        && !query.status.message.equals("Initializing sources")
        && query.lastProgress.sources(0).numInputRows == 0) {
        query.stop()
        DataGenerator.logger.info("stopping query " + query.id)
      }
      query.awaitTermination(10000)
    }
  }

  def runJob(session: SparkSession, param: StreamGenParam): Unit = {
    import param._
    import session.implicits._

    logger.info("Execution started")
    val kinesisEndpoint = "https://kinesis." + region + ".amazonaws.com"

    var query: StreamingQuery = null

    param.name match {
      case "web-sale" =>
        println("Starting streaming web sale data................")
        session.sparkContext.emptyRDD[Row].map(_.toString()).toDF.write.mode("append").text(tmpDir + "/stream_source/web_sale")
        query = session.readStream.schema(RawSchema.webSale)
          .option("maxFilesPerTrigger", 1)
          .parquet(tmpDir + "/stream_source/web_sale")
          .select($"bill_customer_id".as("partitionKey"), to_json(struct("order_id", RawSchema.webSale.names.filter(_ != "order_id"): _*)).as("data"))
          .writeStream.format("kinesis").outputMode("append")
          .option("streamName", targetStream + "-web-sale")
          .option("endpointUrl", kinesisEndpoint)
          .option("kinesis.executor.maxConnections", parallelism)
          .start()
      case "web-customer" =>
        println("Starting streaming web customer data................")
        session.sparkContext.emptyRDD[Row].map(_.toString()).toDF.write.mode("append").text(tmpDir + "/stream_source/web_customer")
        query = session.readStream.schema(RawSchema.webCustomer)
          .option("maxFilesPerTrigger", 1)
          .parquet(tmpDir + "/stream_source/web_customer")
          .select($"customer_id".as("partitionKey"), to_json(struct("customer_id", RawSchema.webCustomer.names.filter(_ != "customer_id"): _*)).as("data"))
          .writeStream.format("kinesis").outputMode("append")
          .option("streamName", targetStream + "-web-customer")
          .option("endpointUrl", kinesisEndpoint)
          .option("kinesis.executor.maxConnections", parallelism)
          .start()
      case "web-customer-address" =>
        println("Starting streaming web customer address data................")
        session.sparkContext.emptyRDD[Row].map(_.toString()).toDF.write.mode("append").text(tmpDir + "/stream_source/web_customer_address")
        query = session.readStream.schema(RawSchema.webCustomerAddress)
          .option("maxFilesPerTrigger", 1)
          .parquet(tmpDir + "/stream_source/web_customer_address")
          .select($"address_id".as("partitionKey"), to_json(struct("address_id", RawSchema.webCustomerAddress.names.filter(_ != "address_id"): _*)).as("data"))
          .writeStream.format("kinesis").outputMode("append")
          .option("streamName", targetStream + "-web-customer-address")
          .option("endpointUrl", kinesisEndpoint)
          .option("kinesis.executor.maxConnections", parallelism)
          .start()
    }
    println("waiting for query to complete.............")
    stopStreamQuery(query)
  }
}
