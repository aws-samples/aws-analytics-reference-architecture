// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import org.apache.spark.sql.types.{DateType, DecimalType, IntegerType, StringType, StructField, StructType, TimestampType}
import org.scalatest.{BeforeAndAfter, BeforeAndAfterAll, DoNotDiscover, FunSuite}

import scala.reflect.io.Path

@DoNotDiscover
class DwhModuleDataTest extends FunSuite with BeforeAndAfterAll{

  import TestUtils._

  override def beforeAll(): Unit = {
    println("generating dwh module data................")
    new DwhModuleData(dwhParam, spark).generateModuleData()
    super.beforeAll()
  }

  test("GenerateDwhModuleData should generate the right DWH module tables") {
    val tableList= List(
      "store_customer",
      "store_customer_address",
      "store",
      "item",
      "promo",
      "store_sale"
    ).map(dwhParam.targetDir+"/"+_)
    assert(!tableList.map(Path(_).exists).contains(false))
  }

  test("GenerateDwhModuleData should generate the right data model for item table") {
    assert(TestUtils.checkParquetSchema(spark,dwhParam.targetDir+"/item",CleanSchema.item))
  }

  test("GenerateDwhModuleData should generate the right data model for promo table") {
    assert(TestUtils.checkParquetSchema(spark,dwhParam.targetDir+"/promo",CleanSchema.promo))
  }

  test("GenerateDwhModuleData should generate the right data model for store table") {
    assert(TestUtils.checkParquetSchema(spark,dwhParam.targetDir+"/store",CleanSchema.store))
  }

  test("GenerateDwhModuleData should generate the right data model for store_customer table") {

    assert(TestUtils.checkParquetSchema(spark,dwhParam.targetDir+"/store_customer",CleanSchema.storeCustomer))
  }

  test("GenerateDwhModuleData should generate the right data model for store_customer_address table") {
    assert(TestUtils.checkParquetSchema(spark,dwhParam.targetDir+"/store_customer_address",CleanSchema.storeCustomerAddress))
  }

  test("GenerateDwhModuleData should generate the right data model for store_sale table") {

    assert(TestUtils.checkParquetSchema(spark,dwhParam.targetDir+"/store_sale",CleanSchema.storeSale))
  }
}
