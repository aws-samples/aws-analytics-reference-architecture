// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import org.apache.spark.sql.types.{ArrayType, DateType, DecimalType, DoubleType, IntegerType, LongType, StringType, StructField, StructType, TimestampType}

object RawSchema {

  val webCustomer = StructType(
    Seq(
      StructField("customer_id", StringType, true),
      StructField("salutation", StringType, true),
      StructField("first_name", StringType, true),
      StructField("last_name", StringType, true),
      StructField("birth_country", StringType, true),
      StructField("email_address", StringType, true),
      StructField("address_id", StringType, true),
      StructField("gender", StringType, true),
      StructField("marital_status", StringType, true),
      StructField("education_status", StringType, true),
      StructField("purchase_estimate", StringType, true),
      StructField("credit_rating", StringType, true),
      StructField("buy_potential", StringType, true),
      StructField("vehicle_count", StringType, true),
      StructField("lower_bound", StringType, true),
      StructField("upper_bound", StringType, true),
      StructField("birth_date", StringType, true),
      StructField("customer_datetime", StringType, true)
    )
  )

  val webCustomerAddress = StructType(
    Seq(
      StructField("address_id", StringType, nullable = true),
      StructField("city", StringType, nullable = true),
      StructField("county", StringType, nullable = true),
      StructField("state", StringType, nullable = true),
      StructField("zip", StringType, nullable = true),
      StructField("country", StringType, nullable = true),
      StructField("gmt_offset", StringType, nullable = true),
      StructField("location_type", StringType, nullable = true),
      StructField("street", StringType, nullable = true),
      StructField("address_datetime", StringType, nullable = true)
    )
  )

  val webSale = StructType(
    Seq(
      StructField("item_id", StringType, nullable = true),
      StructField("order_id", StringType, nullable = true),
      StructField("quantity", StringType, nullable = true),
      StructField("wholesale_cost", StringType, nullable = true),
      StructField("list_price", StringType, nullable = true),
      StructField("sales_price", StringType, nullable = true),
      StructField("ext_discount_amt", StringType, nullable = true),
      StructField("ext_sales_price", StringType, nullable = true),
      StructField("ext_wholesale_cost", StringType, nullable = true),
      StructField("ext_list_price", StringType, nullable = true),
      StructField("ext_tax", StringType, nullable = true),
      StructField("coupon_amt", StringType, nullable = true),
      StructField("ext_ship_cost", StringType, nullable = true),
      StructField("net_paid", StringType, nullable = true),
      StructField("net_paid_inc_tax", StringType, nullable = true),
      StructField("net_paid_inc_ship", StringType, nullable = true),
      StructField("net_paid_inc_ship_tax", StringType, nullable = true),
      StructField("net_profit", StringType, nullable = true),
      StructField("bill_customer_id", StringType, nullable = true),
      StructField("ship_customer_id", StringType, nullable = true),
      StructField("warehouse_id", StringType, nullable = true),
      StructField("promo_id", StringType, nullable = true),
      StructField("ship_delay", StringType, nullable = true),
      StructField("ship_mode", StringType, nullable = true),
      StructField("ship_carrier", StringType, nullable = true),
      StructField("sale_datetime", StringType, nullable = true)
    )
  )

  val item = StructType(
    Seq(
      StructField("item_id", StringType, nullable = true),
      StructField("item_desc", StringType, nullable = true),
      StructField("brand", StringType, nullable = true),
      StructField("class", StringType, nullable = true),
      StructField("category", StringType, nullable = true),
      StructField("manufact", StringType, nullable = true),
      StructField("size", StringType, nullable = true),
      StructField("color", StringType, nullable = true),
      StructField("units", StringType, nullable = true),
      StructField("container", StringType, nullable = true),
      StructField("product_name", StringType, nullable = true),
      StructField("item_datetime", StringType, nullable = true),
      StructField("processing_datetime", IntegerType, nullable = true)
    )
  )

  val promo = StructType(
    Seq(
      StructField("promo_id", StringType, nullable = true),
      StructField("cost", StringType, nullable = true),
      StructField("response_target", StringType, nullable = true),
      StructField("promo_name", StringType, nullable = true),
      StructField("purpose", StringType, nullable = true),
      StructField("start_datetime", StringType, nullable = true),
      StructField("end_datetime", StringType, nullable = true),
      StructField("promo_datetime", StringType, nullable = true),
      StructField("processing_datetime", IntegerType, nullable = true)
    )
  )

  val store = StructType(
    Seq(
      StructField("store_id", StringType, nullable = true),
      StructField("store_name", StringType, nullable = true),
      StructField("number_employees", StringType, nullable = true),
      StructField("floor_space", StringType, nullable = true),
      StructField("hours", StringType, nullable = true),
      StructField("manager", StringType, nullable = true),
      StructField("market_id", StringType, nullable = true),
      StructField("market_manager", StringType, nullable = true),
      StructField("city", StringType, nullable = true),
      StructField("county", StringType, nullable = true),
      StructField("state", StringType, nullable = true),
      StructField("zip", StringType, nullable = true),
      StructField("country", StringType, nullable = true),
      StructField("gmt_offset", StringType, nullable = true),
      StructField("tax_percentage", StringType, nullable = true),
      StructField("street", StringType, nullable = true),
      StructField("store_datetime", StringType, nullable = true),
      StructField("processing_datetime", IntegerType, nullable = true)
    )
  )

  val storeCustomer = StructType(
    Seq(
      StructField("customer_id", StringType, nullable = true),
      StructField("salutation", StringType, nullable = true),
      StructField("first_name", StringType, nullable = true),
      StructField("last_name", StringType, nullable = true),
      StructField("birth_country", StringType, nullable = true),
      StructField("email_address", StringType, nullable = true),
      StructField("birth_date", StringType, nullable = true),
      StructField("gender", StringType, nullable = true),
      StructField("marital_status", StringType, nullable = true),
      StructField("education_status", StringType, nullable = true),
      StructField("purchase_estimate", StringType, nullable = true),
      StructField("credit_rating", StringType, nullable = true),
      StructField("buy_potential", StringType, nullable = true),
      StructField("vehicle_count", StringType, nullable = true),
      StructField("lower_bound", StringType, nullable = true),
      StructField("upper_bound", StringType, nullable = true),
      StructField("address_id", StringType, nullable = true),
      StructField("customer_datetime", StringType, nullable = true),
      StructField("processing_datetime", IntegerType, nullable = true)
    )
  )

  val storeCustomerAddress = StructType(
    Seq(
      StructField("address_id", StringType, nullable = true),
      StructField("city", StringType, nullable = true),
      StructField("county", StringType, nullable = true),
      StructField("state", StringType, nullable = true),
      StructField("zip", StringType, nullable = true),
      StructField("country", StringType, nullable = true),
      StructField("gmt_offset", StringType, nullable = true),
      StructField("location_type", StringType, nullable = true),
      StructField("street", StringType, nullable = true),
      StructField("address_datetime", StringType, nullable = true),
      StructField("processing_datetime", IntegerType, nullable = true)
    )
  )

  val storeSale1 = StructType(
    Seq(
      StructField("item_id", StringType, nullable = true),
      StructField("ticket_id", StringType, nullable = true),
      StructField("quantity", StringType, nullable = true),
      StructField("wholesale_cost", StringType, nullable = true),
      StructField("list_price", StringType, nullable = true),
      StructField("sales_price", StringType, nullable = true),
      StructField("ext_discount_amt", StringType, nullable = true),
      StructField("ext_sales_price", StringType, nullable = true),
      StructField("ext_wholesale_cost", StringType, nullable = true),
      StructField("ext_list_price", StringType, nullable = true),
      StructField("ext_tax", StringType, nullable = true),
      StructField("coupon_amt", StringType, nullable = true),
      StructField("net_paid", StringType, nullable = true),
      StructField("net_paid_inc_tax", StringType, nullable = true),
      StructField("net_profit", StringType, nullable = true),
      StructField("customer_id", StringType, nullable = true),
      StructField("store_id", StringType, nullable = true),
      StructField("promo_id", StringType, nullable = true),
      StructField("sale_datetime", StringType, nullable = true),
      StructField("processing_datetime", IntegerType, nullable = true)
    )
  )

  val storeSale2 = StructType(
    Seq(
      StructField("customer_id", StringType, nullable = true),
      StructField("items",
        ArrayType(
          StructType(
            Seq(
              StructField("coupon_amt", DoubleType, nullable = true),
              StructField("ext_discount_amt", DoubleType, nullable = true),
              StructField("ext_list_price", DoubleType, nullable = true),
              StructField("ext_sales_price", DoubleType, nullable = true),
              StructField("ext_tax", DoubleType, nullable = true),
              StructField("ext_wholesale_cost", DoubleType, nullable = true),
              StructField("item_id", LongType, nullable = true),
              StructField("list_price", DoubleType, nullable = true),
              StructField("net_paid", DoubleType, nullable = true),
              StructField("net_paid_inc_tax", DoubleType, nullable = true),
              StructField("net_profit", DoubleType, nullable = true),
              StructField("promo_id", StringType, nullable = true),
              StructField("quantity", LongType, nullable = true),
              StructField("sales_price", DoubleType, nullable = true),
              StructField("wholesale_cost", DoubleType, nullable = true)
            )
          )
        )
      ),
      StructField("sale_datetime", StringType, nullable = true),
      StructField("store_id", StringType, nullable = true),
      StructField("ticket_id", LongType, nullable = true),
      StructField("processing_datetime", IntegerType, nullable = true)
    )
  )

  val warehouse = StructType(
    Seq(
      StructField("warehouse_id", StringType, nullable = true),
      StructField("warehouse_name", StringType, nullable = true),
      StructField("street", StringType, nullable = true),
      StructField("city", StringType, nullable = true),
      StructField("zip", StringType, nullable = true),
      StructField("county", StringType, nullable = true),
      StructField("state", StringType, nullable = true),
      StructField("country", StringType, nullable = true),
      StructField("gmt_offset", StringType, nullable = true),
      StructField("warehouse_datetime", StringType, nullable = true),
      StructField("processing_datetime", IntegerType, nullable = true)
    )
  )
}