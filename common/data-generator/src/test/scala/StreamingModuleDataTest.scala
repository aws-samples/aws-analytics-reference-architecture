// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import org.apache.spark.sql.types.{DateType, DecimalType, IntegerType, StringType, StructField, StructType, TimestampType}
import org.scalatest.{BeforeAndAfter, BeforeAndAfterAll, DoNotDiscover, FunSuite}

import scala.reflect.io.Path

@DoNotDiscover
class StreamingModuleDataTest extends FunSuite with BeforeAndAfterAll{

  import TestUtils._

  override def beforeAll(): Unit = {
    println("generating streaming module static data................")
    new StreamingModuleData(streamParam, spark).generateModuleData()
    super.beforeAll()
  }

  test("GenerateDwhModuleData should generate the right batch module tables") {
    val tableList= List(
      streamParam.streamSource+"/customer",
      streamParam.streamSource+"/address",
      streamParam.targetDir+"/warehouse",
      streamParam.targetDir+"/item",
      streamParam.targetDir+"/promo",
      streamParam.streamSource+"/sale"
    )
    assert(!tableList.map(Path(_).exists).contains(false))
  }

  test("GenerateModuleData for Streaming should generate the right data model for item table") {
    assert(TestUtils.checkCsvSchema(spark,streamParam.targetDir+"/item",RawSchema.item))
  }

  test("GenerateModuleData for Streaming should generate the right data model for promo table") {
    assert(TestUtils.checkCsvSchema(spark,streamParam.targetDir+"/promo",RawSchema.promo))
  }

  test("GenerateModuleData for Streaming should generate the right data model for warehouse table") {
    assert(TestUtils.checkCsvSchema(spark,streamParam.targetDir+"/warehouse",RawSchema.warehouse))
  }

  test("GenerateModuleData for Streaming should generate the right data model for web_customer table") {

    assert(TestUtils.checkCsvSchema(spark,streamParam.streamSource+"/customer",RawSchema.webCustomer))
  }

  test("GenerateModuleData for Streaming should generate the right data model for store_customer_address table") {
    assert(TestUtils.checkCsvSchema(spark,streamParam.streamSource+"/address",RawSchema.webCustomerAddress))
  }

  test("GenerateModuleData for Streaming should generate the right data model for web_sale table") {
    assert(TestUtils.checkCsvSchema(spark,streamParam.streamSource+"/sale",RawSchema.webSale))
  }
}
