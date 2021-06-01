// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import org.apache.spark.SparkConf
import org.apache.spark.sql.{Dataset, Row, SparkSession}
import org.apache.spark.sql.types.StructType

import scala.util.{Failure, Success, Try}

object TestUtils {

  val param = DataGenParam()
  val batchParam = DataGenParam(targetDir="src/test/resources/results/raw")
  val dwhParam = DataGenParam(targetDir="src/test/resources/results/cleaned")
  val streamParam = DataGenParam(targetDir="src/test/resources/results/stream")

  val conf = new SparkConf()
    .setMaster("local[*]")
    .setAppName("data-generator")
    .set("spark.driver.allowMultipleContexts", "false")
    .set("spark.driver.memory","6g")
    .set("spark.sql.shuffle.partitions",param.parallelism.toString)
    .set("spark.ui.enabled", "true")
    .set("spark.ui.enabled", "true")
    .set("spark.sql.session.timeZone", "UTC")

  val spark = SparkSession.builder().config(conf).getOrCreate()

  def checkCsvSchema(spark: SparkSession, tablePath: String, tableSchema: StructType): Boolean = {
    val dfLoad = Try(spark.read.option("header","true").csv(tablePath))
    checkSchema(dfLoad, tableSchema)
  }

  def checkParquetSchema(spark: SparkSession, tablePath: String, tableSchema: StructType): Boolean = {
    val dfLoad = Try(spark.read.parquet(tablePath))
    checkSchema(dfLoad, tableSchema)
  }

  def checkJsonSchema(spark: SparkSession, tablePath: String, tableSchema: StructType): Boolean = {
    val dfLoad = Try(spark.read.json(tablePath))
    checkSchema(dfLoad, tableSchema)
  }

  private def checkSchema(dfLoad: Try[Dataset[Row]], schema: StructType): Boolean = {
    dfLoad match {
      case Success(df) => df.printSchema; schema.printTreeString(); df.schema.diff(schema).isEmpty
      case Failure(f) => {
        println(f)
        false
      }
    }
  }
}
