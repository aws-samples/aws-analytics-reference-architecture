// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import org.apache.log4j.Logger
import org.apache.log4j.Level
import org.apache.spark.sql.SparkSession
import scala.util.{Try,Success,Failure}

object DataGenerator {

  val logger = Logger.getLogger(this.getClass)

  def main(args: Array[String]) {

    logger.setLevel(Level.INFO)

    // check arguments
    val usage = """
                  |Usage :
                  |TpcGenerator.jar
                  |module: the name of the module to generate the data
                  |dataGenBinDir: the binary path for DSDGEN
                  |tmpDir: the transient local path (on HDFS) to store raw TPCDS data before transforming for modules
                  |targetDir: the path where to write final data (s3 bucket)
                  |scaleFactor: the number of GB to generate
                  |fileFormat: CSV or Parquet (for file Sink)
                  |parallelism: the number of Spark partitions to use
                  |partitionedOutput: if the output is partitioned by date (for file Sink)
                  |singleFileOutput: if the output is coalesced into a single file (for file Sink)
                  |iteration: 0 for initial generation, 1...n for new data feed
                  |startDate: the start date to use for event timestamp
                  |endDate: the end date to use for event timestamp
                  |streamSource: the transient path to store streaming data source
                  |"""

    val param = Try(DataGenParam(
      args(0),
      args(1),
      args(2),
      args(3),
      args(4).toInt,
      args(5),
      args(6).toInt,
      args(7).toBoolean,
      args(8).toBoolean,
      args(9).toInt,
      args(10),
      args(11),
      args(12)
    ))

    param match {
      case Success(param) => {
        lazy val session =
          SparkSession.builder
            .config("spark.sql.session.timeZone", "UTC")
            .config("spark.sql.shuffle.partitions", param.parallelism)
            .appName("data-generator")
            .getOrCreate()
        runJob(session, param)
        session.stop()
      }
      case Failure(f) => {
        println(f)
        println(usage)
        System.exit(1)
      }
    }
  }

  def runJob(sparkSession: SparkSession,param : DataGenParam) = {
    import param._
    logger.info("Execution started")
    param.module match {
      case "dwh" => {
        val data = new DwhModuleData(param,sparkSession)
        println("Starting base data generation with DSDGEN................")
        data.generateBaseData()
        println("Data generated into tmp directory..............")
        println("Starting data generation for DWH module..............")
        data.generateModuleData()
      }
      case "batch" => {
        val data = new BatchModuleData(param,sparkSession)
        println("Starting base data generation with DSDGEN...............")
        data.generateBaseData()
        println("Data generated into tmp directory...............")
        println("Starting data generation for Batch module..............")
        data.generateModuleData()
      }
      case "stream" => {
        val data = new StreamingModuleData(param,sparkSession)
        println("Starting base data generation with DSDGEN...............")
        data.generateBaseData()
        println("Data generated into tmp directory.............")
        println("Starting data generation for Streaming module..............")
        data.generateModuleData()
      }
    }
  }
}
