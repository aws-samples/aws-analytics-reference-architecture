// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import org.apache.spark.sql.types.{ArrayType, DoubleType, IntegerType, LongType, StringType, StructField, StructType, TimestampType}
import org.scalatest.{BeforeAndAfter, BeforeAndAfterAll, DoNotDiscover, FunSuite}

import scala.reflect.io.Path
import scala.util.{Failure, Success, Try}

@DoNotDiscover
class BatchModuleDataTest extends FunSuite with BeforeAndAfterAll {

  import TestUtils._

  override def beforeAll(): Unit = {
    println("""generating batch module data................""")
    new BatchModuleData(batchParam, spark).generateModuleData()
    super.beforeAll()
  }

  test("GenerateBatchModuleData should generate the right batch module tables") {
    val tableList= List(
      "store_customer",
      "store_customer_address",
      "store",
      "item",
      "promo",
      "store_sale1",
      "store_sale2"
    ).map(batchParam.targetDir+"/"+_)
    assert(!tableList.map(Path(_).exists).contains(false))
  }

  test("GenerateBatchModuleData should generate the right data model for item table") {
    assert(TestUtils.checkCsvSchema(spark,batchParam.targetDir+"/item",RawSchema.item))
  }

  test("GenerateBatchModuleData should generate the right data model for promo table") {
    assert(TestUtils.checkCsvSchema(spark,batchParam.targetDir+"/promo",RawSchema.promo))
  }

  test("GenerateBatchModuleData should generate the right data model for store table") {
    assert(TestUtils.checkCsvSchema(spark,batchParam.targetDir+"/store",RawSchema.store))
  }

  test("GenerateBatchModuleData should generate the right data model for store_customer table") {
    assert(TestUtils.checkCsvSchema(spark,batchParam.targetDir+"/store_customer",RawSchema.storeCustomer))
  }

  test("GenerateBatchModuleData should generate the right data model for store_customer_address table") {
    assert(TestUtils.checkCsvSchema(spark,batchParam.targetDir+"/store_customer_address",RawSchema.storeCustomerAddress))
  }

  test("GenerateBatchModuleData should generate the right data model for store_sale1 table") {
    assert(TestUtils.checkCsvSchema(spark,batchParam.targetDir+"/store_sale1",RawSchema.storeSale1))
  }

  test("GenerateBatchModuleData should generate the right data model for store_sale2 table") {
    assert(TestUtils.checkJsonSchema(spark,batchParam.targetDir+"/store_sale2",RawSchema.storeSale2))
  }
}
