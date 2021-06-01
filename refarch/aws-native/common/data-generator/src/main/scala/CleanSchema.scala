// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import org.apache.spark.sql.types.{DateType, DecimalType, IntegerType, LongType, StringType, StructField, StructType, TimestampType}

object CleanSchema {
  
  val item = StructType(
    Seq(
      StructField("item_id", IntegerType, nullable = true),
      StructField("item_datetime", TimestampType, nullable = true),
      StructField("product_name", StringType, nullable = true),
      StructField("item_desc", StringType, nullable = true),
      StructField("brand", StringType, nullable = true),
      StructField("class", StringType, nullable = true),
      StructField("category", StringType, nullable = true),
      StructField("manufact", StringType, nullable = true),
      StructField("size", StringType, nullable = true),
      StructField("color", StringType, nullable = true),
      StructField("units", StringType, nullable = true),
      StructField("container", StringType, nullable = true),
      StructField("processing_datetime", TimestampType, nullable = true),
      StructField("item_date", DateType, nullable = true)
    )
  )

  val promo = StructType(
    Seq(
      StructField("promo_id", StringType, nullable = true),
      StructField("promo_datetime", TimestampType, nullable = true),
      StructField("promo_name", StringType, nullable = true),
      StructField("start_datetime", TimestampType, nullable = true),
      StructField("end_datetime", TimestampType, nullable = true),
      StructField("purpose", StringType, nullable = true),
      StructField("response_target", IntegerType, nullable = true),
      StructField("cost", DecimalType(15,2), nullable = true),
      StructField("processing_datetime", TimestampType, nullable = true),
      StructField("promo_date", DateType, nullable = true)
    )
  )

  val store = StructType(
    Seq(
      StructField("store_id", StringType, nullable = true),
      StructField("store_datetime", TimestampType, nullable = true),
      StructField("store_name", StringType, nullable = true),
      StructField("street", StringType, nullable = true),
      StructField("city", StringType, nullable = true),
      StructField("zip", StringType, nullable = true),
      StructField("county", StringType, nullable = true),
      StructField("state", StringType, nullable = true),
      StructField("country", StringType, nullable = true),
      StructField("gmt_offset", DecimalType(5,2), nullable = true),
      StructField("tax_percentage", DecimalType(5,2), nullable = true),
      StructField("hours", StringType, nullable = true),
      StructField("floor_space", IntegerType, nullable = true),
      StructField("number_employees", IntegerType, nullable = true),
      StructField("manager", StringType, nullable = true),
      StructField("market_id", IntegerType, nullable = true),
      StructField("market_manager", StringType, nullable = true),
      StructField("processing_datetime", TimestampType, nullable = true),
      StructField("store_date", DateType, nullable = true)
    )
  )

  val storeCustomer = StructType(
    Seq(
      StructField("customer_id", StringType, nullable = true),
      StructField("customer_datetime", TimestampType, nullable = true),
      StructField("first_name", StringType, nullable = true),
      StructField("last_name", StringType, nullable = true),
      StructField("salutation", StringType, nullable = true),
      StructField("gender", StringType, nullable = true),
      StructField("birth_date", DateType, nullable = true),
      StructField("birth_country", StringType, nullable = true),
      StructField("email_address", StringType, nullable = true),
      StructField("marital_status", StringType, nullable = true),
      StructField("education_status", StringType, nullable = true),
      StructField("lower_bound", IntegerType, nullable = true),
      StructField("upper_bound", IntegerType, nullable = true),
      StructField("purchase_estimate", IntegerType, nullable = true),
      StructField("buy_potential", StringType, nullable = true),
      StructField("credit_rating", StringType, nullable = true),
      StructField("vehicle_count", IntegerType, nullable = true),
      StructField("address_id", StringType, nullable = true),
      StructField("processing_datetime", TimestampType, nullable = true),
      StructField("customer_date", DateType, nullable = true)
    )
  )

  val storeCustomerAddress = StructType(
    Seq(
      StructField("address_id", StringType, nullable = true),
      StructField("address_datetime", TimestampType, nullable = true),
      StructField("street", StringType, nullable = true),
      StructField("city", StringType, nullable = true),
      StructField("zip", StringType, nullable = true),
      StructField("county", StringType, nullable = true),
      StructField("state", StringType, nullable = true),
      StructField("country", StringType, nullable = true),
      StructField("gmt_offset", DecimalType(5,2), nullable = true),
      StructField("location_type", StringType, nullable = true),
      StructField("processing_datetime", TimestampType, nullable = true),
      StructField("address_date", DateType, nullable = true)
    )
  )

  val storeSale = StructType(
    Seq(
      StructField("ticket_id", LongType, nullable = true),
      StructField("item_id", IntegerType, nullable = true),
      StructField("sale_datetime", TimestampType, nullable = true),
      StructField("quantity", IntegerType, nullable = true),
      StructField("wholesale_cost", DecimalType(7,2), nullable = true),
      StructField("list_price", DecimalType(7,2), nullable = true),
      StructField("sales_price", DecimalType(7,2), nullable = true),
      StructField("ext_discount_amt", DecimalType(7,2), nullable = true),
      StructField("ext_sales_price", DecimalType(7,2), nullable = true),
      StructField("ext_wholesale_cost", DecimalType(7,2), nullable = true),
      StructField("ext_list_price", DecimalType(7,2), nullable = true),
      StructField("ext_tax", DecimalType(7,2), nullable = true),
      StructField("coupon_amt", DecimalType(7,2), nullable = true),
      StructField("net_paid", DecimalType(7,2), nullable = true),
      StructField("net_paid_inc_tax", DecimalType(7,2), nullable = true),
      StructField("net_profit", DecimalType(7,2), nullable = true),
      StructField("customer_id", StringType, nullable = true),
      StructField("store_id", StringType, nullable = true),
      StructField("promo_id", StringType, nullable = true),
      StructField("processing_datetime", TimestampType, nullable = true),
      StructField("sale_date", DateType, nullable = true)
    )
  )

  val warehouse = StructType(
    Seq(
      StructField("warehouse_id", StringType, nullable = true),
      StructField("warehouse_datetime", TimestampType, nullable = true),
      StructField("warehouse_name", StringType, nullable = true),
      StructField("street", StringType, nullable = true),
      StructField("city", StringType, nullable = true),
      StructField("zip", StringType, nullable = true),
      StructField("county", StringType, nullable = true),
      StructField("state", StringType, nullable = true),
      StructField("country", StringType, nullable = true),
      StructField("gmt_offset", DecimalType(5,2), nullable = true),
      StructField("processing_datetime", TimestampType, nullable = true)
    )
  )
}
