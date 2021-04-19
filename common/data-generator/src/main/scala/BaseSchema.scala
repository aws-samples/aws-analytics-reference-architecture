// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import org.apache.spark.sql.types.{ArrayType, DateType, DecimalType, DoubleType, IntegerType, LongType, StringType, StructField, StructType, TimestampType}

object BaseSchema {

  val customer = StructType(
    Seq(
      StructField("c_customer_id", StringType, true),
      StructField("c_salutation", StringType, true),
      StructField("c_first_name", StringType, true),
      StructField("c_last_name", StringType, true),
      StructField("c_birth_country", StringType, true),
      StructField("c_email_address", StringType, true),
      StructField("c_address_id", StringType, true),
      StructField("c_gender", StringType, true),
      StructField("c_marital_status", StringType, true),
      StructField("c_education_status", StringType, true),
      StructField("c_purchase_estimate", IntegerType, true),
      StructField("c_credit_rating", StringType, true),
      StructField("c_buy_potential", StringType, true),
      StructField("c_vehicle_count", IntegerType, true),
      StructField("c_lower_bound", IntegerType, true),
      StructField("c_upper_bound", IntegerType, true),
      StructField("c_birth_day", IntegerType, true),
      StructField("c_birth_month", IntegerType, true),
      StructField("c_birth_year", IntegerType, true),
      StructField("c_customer_datetime", TimestampType, true)
    )
  )

  val customerAddress = StructType(
    Seq(
      StructField("ca_address_id", StringType, nullable = true),
      StructField("ca_city", StringType, nullable = true),
      StructField("ca_county", StringType, nullable = true),
      StructField("ca_state", StringType, nullable = true),
      StructField("ca_zip", StringType, nullable = true),
      StructField("ca_country", StringType, nullable = true),
      StructField("ca_gmt_offset", DecimalType(5, 2), nullable = true),
      StructField("ca_location_type", StringType, nullable = true),
      StructField("ca_street_number", StringType, nullable = true),
      StructField("ca_street_name", StringType, nullable = true),
      StructField("ca_street_type", StringType, nullable = true),
      StructField("ca_address_datetime", TimestampType, nullable = true)
    )
  )

  val webSale = StructType(
    Seq(
      StructField("ws_item_id", IntegerType, nullable = true),
      StructField("ws_order_id", LongType, nullable = true),
      StructField("ws_quantity", IntegerType, nullable = true),
      StructField("ws_wholesale_cost", DecimalType(7, 2), nullable = true),
      StructField("ws_list_price", DecimalType(7, 2), nullable = true),
      StructField("ws_sales_price", DecimalType(7, 2), nullable = true),
      StructField("ws_ext_discount_amt", DecimalType(7, 2), nullable = true),
      StructField("ws_ext_sales_price", DecimalType(7, 2), nullable = true),
      StructField("ws_ext_wholesale_cost", DecimalType(7, 2), nullable = true),
      StructField("ws_ext_list_price", DecimalType(7, 2), nullable = true),
      StructField("ws_ext_tax", DecimalType(7, 2), nullable = true),
      StructField("ws_coupon_amt", DecimalType(7, 2), nullable = true),
      StructField("ws_ext_ship_cost", DecimalType(7, 2), nullable = true),
      StructField("ws_net_paid", DecimalType(7, 2), nullable = true),
      StructField("ws_net_paid_inc_tax", DecimalType(7, 2), nullable = true),
      StructField("ws_net_paid_inc_ship", DecimalType(7, 2), nullable = true),
      StructField("ws_net_paid_inc_ship_tax", DecimalType(7, 2), nullable = true),
      StructField("ws_net_profit", DecimalType(7, 2), nullable = true),
      StructField("ws_bill_customer_id", StringType, nullable = true),
      StructField("ws_ship_customer_id", StringType, nullable = true),
      StructField("ws_warehouse_id", StringType, nullable = true),
      StructField("ws_promo_id", StringType, nullable = true),
      StructField("ws_ship_delay", StringType, nullable = true),
      StructField("ws_ship_mode", StringType, nullable = true),
      StructField("ws_ship_carrier", StringType, nullable = true),
      StructField("ws_sale_datetime", TimestampType, nullable = true)
    )
  )

  val item = StructType(
    Seq(
      StructField("i_item_desc", StringType, nullable = true),
      StructField("i_brand", StringType, nullable = true),
      StructField("i_class", StringType, nullable = true),
      StructField("i_category", StringType, nullable = true),
      StructField("i_manufact", StringType, nullable = true),
      StructField("i_size", StringType, nullable = true),
      StructField("i_color", StringType, nullable = true),
      StructField("i_units", StringType, nullable = true),
      StructField("i_container", StringType, nullable = true),
      StructField("i_product_name", StringType, nullable = true),
      StructField("i_item_id", StringType, nullable = true),
      StructField("item_datetime", StringType, nullable = true),
      StructField("processing_datetime", IntegerType, nullable = true)
    )
  )

  val promo = StructType(
    Seq(
      StructField("p_promo_id", StringType, nullable = true),
      StructField("p_cost", StringType, nullable = true),
      StructField("p_response_target", StringType, nullable = true),
      StructField("p_promo_name", StringType, nullable = true),
      StructField("p_purpose", StringType, nullable = true),
      StructField("p_promo_start_date", StringType, nullable = true),
      StructField("p_promo_end_date", StringType, nullable = true),
      StructField("promo_datetime", StringType, nullable = true),
      StructField("processing_datetime", IntegerType, nullable = true)
    )
  )

  val store = StructType(
    Seq(
      StructField("s_store_id", StringType, nullable = true),
      StructField("s_store_name", StringType, nullable = true),
      StructField("s_number_employees", StringType, nullable = true),
      StructField("s_floor_space", StringType, nullable = true),
      StructField("s_hours", StringType, nullable = true),
      StructField("s_manager", StringType, nullable = true),
      StructField("s_market_id", StringType, nullable = true),
      StructField("s_market_manager", StringType, nullable = true),
      StructField("s_store_city", StringType, nullable = true),
      StructField("s_store_county", StringType, nullable = true),
      StructField("s_store_state", StringType, nullable = true),
      StructField("s_store_zip", StringType, nullable = true),
      StructField("s_store_country", StringType, nullable = true),
      StructField("s_store_gmt_offset", StringType, nullable = true),
      StructField("s_tax_percentage", StringType, nullable = true),
      StructField("s_store_street", StringType, nullable = true),
      StructField("s_store_datetime", StringType, nullable = true),
      StructField("processing_datetime", IntegerType, nullable = true)
    )
  )

  val storeSale = StructType(
    Seq(
      StructField("ss_item_id", StringType, nullable = true),
      StructField("ss_ticket_id", StringType, nullable = true),
      StructField("ss_quantity", StringType, nullable = true),
      StructField("ss_wholesale_cost", StringType, nullable = true),
      StructField("ss_list_price", StringType, nullable = true),
      StructField("ss_sales_price", StringType, nullable = true),
      StructField("ss_ext_discount_amt", StringType, nullable = true),
      StructField("ss_ext_sales_price", StringType, nullable = true),
      StructField("ss_ext_wholesale_cost", StringType, nullable = true),
      StructField("ss_ext_list_price", StringType, nullable = true),
      StructField("ss_ext_tax", StringType, nullable = true),
      StructField("ss_coupon_amt", StringType, nullable = true),
      StructField("ss_net_paid", StringType, nullable = true),
      StructField("ss_net_paid_inc_tax", StringType, nullable = true),
      StructField("ss_net_profit", StringType, nullable = true),
      StructField("ss_customer_id", StringType, nullable = true),
      StructField("ss_store_id", StringType, nullable = true),
      StructField("ss_promo_id", StringType, nullable = true),
      StructField("sale_datetime", StringType, nullable = true),
      StructField("processing_datetime", IntegerType, nullable = true)
    )
  )
}
