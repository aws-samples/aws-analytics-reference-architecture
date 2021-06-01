// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import org.apache.spark.sql.SparkSession
import org.apache.spark.sql.functions._

class DwhModuleData(val param: DataGenParam, val session: SparkSession) extends BaseData {

  // Read from temporary directory, refactor the data model and write to final destination for DWH module
  def generateModuleData() ={

    import param._
    import session.implicits._

    val fullDF = super.generateStoreChannelData(baseData)
    println("generating dwh data.......................")

    println("writing store sale.......................")
    fullDF("storeSale")
      .withColumn("sale_date",to_date($"sale_datetime"))
      .withColumn("processing_datetime",$"processing_datetime".cast("timestamp"))
      .select("ticket_id",CleanSchema.storeSale.fieldNames.filter(_!="ticket_id"): _*)
      .repartition($"sale_date").sortWithinPartitions("ticket_id")
      .write.mode("append").partitionBy("sale_date").parquet(targetDir+"/store_sale")

    println("writing item.......................")
    fullDF("item")
      .withColumn("item_date",to_date($"item_datetime"))
      .withColumn("processing_datetime",$"processing_datetime".cast("timestamp"))
      .select("item_id",CleanSchema.item.fieldNames.filter(_!="item_id"): _*)
      .repartition($"item_date").sortWithinPartitions("item_id")
      .write.mode("append").partitionBy("item_date").parquet(targetDir+"/item")

    println("writing store.......................")
    fullDF("store")
      .withColumn("store_date",to_date($"store_datetime"))
      .withColumn("processing_datetime",$"processing_datetime".cast("timestamp"))
      .select("store_id", CleanSchema.store.fieldNames.filter(_!="store_id"): _*)
      .repartition($"store_date").sortWithinPartitions("store_id")
      .write.mode("append").partitionBy("store_date").parquet(targetDir+"/store")

    println("writing promo.......................")
    fullDF("promo")
      .withColumn("promo_date",to_date($"promo_datetime"))
      .withColumn("processing_datetime",$"processing_datetime".cast("timestamp"))
      .select("promo_id",CleanSchema.promo.fieldNames.filter(_!="promo_id"): _*)
      .repartition($"promo_date").sortWithinPartitions("promo_id")
      .write.mode("append").partitionBy("promo_date").parquet(targetDir+"/promo")

    println("writing customer.......................")
    fullDF("customer")
      .withColumn("customer_date",to_date($"customer_datetime"))
      .withColumn("processing_datetime",$"processing_datetime".cast("timestamp"))
      .select("customer_id",CleanSchema.storeCustomer.fieldNames.filter(_!="customer_id"): _*)
      .repartition($"customer_date").sortWithinPartitions("customer_id")
      .write.mode("append").partitionBy("customer_date").parquet(targetDir+"/store_customer")

    println("writing customer address.......................")
    fullDF("customerAddress")
      .withColumn("address_date",to_date($"address_datetime"))
      .withColumn("processing_datetime",$"processing_datetime".cast("timestamp"))
      .select("address_id",CleanSchema.storeCustomerAddress.fieldNames.filter(_!="address_id"): _*)
      .repartition($"address_date").sortWithinPartitions("address_id")
      .write.mode("append").partitionBy("address_date").parquet(targetDir+"/store_customer_address")
  }
}
