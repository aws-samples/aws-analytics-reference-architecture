// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import org.apache.spark.sql.{Row, SparkSession}
import org.apache.spark.sql.functions.{collect_list, concat, explode, format_string, lit, struct, to_date, to_json}
import org.apache.spark.sql.streaming.StreamingQuery


class StreamingModuleData(val param: DataGenParam, val session: SparkSession) extends BaseData {

  import DataframeUtils._
  import param._
  import session.implicits._

  def generateModuleData() = {
    import param._

    val allDF = super.generateWebChannelData(baseData)

    println("generating streaming data.......................")

    println("writing web sale .......................")
    allDF("webSale")
      .select("item_id",RawSchema.webSale.fieldNames.filter(_!="item_id"): _*)
      .write.mode("append").option("header", "true").csv(streamSource+"/sale")

    println("writing customer.......................")
    allDF("customer").select("customer_id",RawSchema.webCustomer.fieldNames.filter(_!="customer_id"): _*)
      .write.mode("append").option("header", "true").csv(streamSource+"/customer")

    println("writing customer address.......................")
    allDF("customerAddress").select("address_id",RawSchema.webCustomerAddress.fieldNames.filter(_!="address_id"): _*)
      .write.mode("append").option("header", "true").csv(streamSource+"/address")

    println("writing item.......................")
    allDF("item").select("item_id",RawSchema.item.fieldNames.filter(_!="item_id"): _*)
      .write.option("header", "true").mode("append").partitionBy("processing_datetime").csv(targetDir+"/item")

    println("writing warehouse.......................")
    allDF("warehouse")
      .select("warehouse_id", RawSchema.warehouse.fieldNames.filter(_!="warehouse_id"): _*)
      .write.option("header", "true").mode("append").partitionBy("processing_datetime").csv(targetDir+"/warehouse")

    println("writing promo.......................")
    allDF("promo").select("promo_id",RawSchema.promo.fieldNames.filter(_!="promo_id"): _*)
      .write.option("header", "true").mode("append").partitionBy("processing_datetime").csv(targetDir+"/promo")
  }
}
