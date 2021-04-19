// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import org.apache.spark.sql.SparkSession
import org.apache.spark.sql.functions._

class BatchModuleData(val param: DataGenParam, val session: SparkSession) extends BaseData {

  // Read from temporary directory, refactor the data model and write to final destination for batch module
  def generateModuleData() ={

    import param._

    val allDF = super.generateStoreChannelData(baseData)
    println("generating batch data.......................")

    val storeSale = allDF("storeSale")
      .select("item_id",RawSchema.storeSale1.fieldNames.filter(_!="item_id"): _*)
    val storeSaleTmp = storeSale
      .sample(0.5)
    storeSaleTmp.cache

    println("writing store sale1.......................")
    storeSaleTmp.write.option("header", "true").mode("append").partitionBy("processing_datetime").csv(targetDir+"/store_sale1")

    println("writing store sale 2.......................")
    storeSale
      .except(storeSaleTmp)
      .groupBy("ticket_id","sale_datetime","store_id","processing_datetime", "customer_id")
      .agg(
        collect_list(
          struct("item_id",storeSaleTmp.columns
            .filter(!List("ticket_id","item_id","sale_datetime","store_id","processing_datetime","customer_id").contains(_)): _*)
        ).alias("items")
      )
      .write.mode("append").partitionBy("processing_datetime").json(targetDir+"/store_sale2")

    println("writing customer.......................")
    allDF("customer").select("customer_id",RawSchema.storeCustomer.fieldNames.filter(_!="customer_id"): _*)
      .write.option("header", "true").mode("append").partitionBy("processing_datetime").csv(targetDir+"/store_customer")

    println("writing customer address.......................")
    allDF("customerAddress").select("address_id",RawSchema.storeCustomerAddress.fieldNames.filter(_!="address_id"): _*)
      .write.option("header", "true").mode("append").partitionBy("processing_datetime").csv(targetDir+"/store_customer_address")

    println("writing item.......................")
    allDF("item").select("item_id",RawSchema.item.fieldNames.filter(_!="item_id"): _*)
      .write.option("header", "true").mode("append").partitionBy("processing_datetime").csv(targetDir+"/item")

    println("writing store.......................")
    allDF("store").select("store_id", RawSchema.store.fieldNames.filter(_!="store_id"): _*)
      .write.option("header", "true").mode("append").partitionBy("processing_datetime").csv(targetDir+"/store")

    println("writing promo.......................")
    allDF("promo").select("promo_id",RawSchema.promo.fieldNames.filter(_!="promo_id"): _*)
      .write.option("header", "true").mode("append").partitionBy("processing_datetime").csv(targetDir+"/promo")
  }
}
