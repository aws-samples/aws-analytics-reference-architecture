// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import com.databricks.spark.sql.perf.Tables
import com.databricks.spark.sql.perf.tpcds.TPCDSTables
import org.apache.spark.sql.expressions.Window
import org.apache.spark.sql.{Dataset, Row, SparkSession}
import org.apache.spark.sql.functions._

trait BaseData{

  val param: DataGenParam
  val session: SparkSession

  lazy val baseData = generateCommonData()
  val tableList = List("customer","customer_address","customer_demographics","date_dim","household_demographics","income_band",
  "item","promotion","ship_mode","store","store_sales","warehouse","web_sales")

  import param._
  import session.implicits._
  import DataframeUtils._

  // Use tpcds generator to generate data with the tpcds data model and write to temporary directory (should be HDFS path on EMR cluster)
  def generateBaseData() ={

    println("generating base data.......................")
    val tables : Tables = new TPCDSTables(session.sqlContext,
      param.dsdgenDir ,
      param.scaleFactor.toString ,
      useDoubleForDecimal = false, // true to replace DecimalType with DoubleType
      useStringForDate = true) // true to replace DateType with StringType

    tableList.foreach{ t =>
      tables.genData(
        location = param.tmpDir,
        format = "parquet",
        overwrite = true, // overwrite the data that is already there
        partitionTables = param.partitionedOutput, // create the partitioned fact tables
        clusterByPartitionColumns = param.singleFileOutput, // shuffle to get partitions coalesced into single files.
        filterOutNullPartitionValues = false, // true to filter out the partition with NULL key value
        tableFilter = t, // "" means generate all tables
        numPartitions = param.parallelism)
        //iteration = param.iteration) // how many dsdgen partitions to run - number of input tasks.
    }
  }

  def generateCommonData(): Map[String, Dataset[Row]] ={

    println("generating common data.......................")

    // baseCustomer contains all the customers from store and web channel
    val baseCustomer = session.read.parquet(tmpDir+"/customer")
      // project only required columns
      .drop("c_first_shipto_date_sk","c_first_sales_date_sk","c_preferred_cust_flag","c_login","c_last_review_date")

    // baseCustomerAddress contains all the customers from store and web channel
    val baseCustomerAddress = session.read.parquet(tmpDir+"/customer_address")
      // project only required columns
      .drop("ca_suite_number")

    val baseStoreSale = session.read.parquet(tmpDir+"/store_sales")
      // project only required columns
      .drop("ss_cdemo_sk","ss_hdemo_sk","ss_addr_sk","ss_sold_date_sk","ss_sold_time_sk")

    val baseWebSale = session.read.parquet(tmpDir+"/web_sales")
      // project only required columns
      .drop("ws_bill_cdemo_sk", "ws_ship_cdemo_sk","ws_bill_hdemo_sk", "ws_ship_hdemo_sk","ws_bill_addr_sk",
        "ws_ship_addr_sk","ws_sold_date_sk","ws_sold_time_sk", "ws_web_page_sk", "ws_web_site_sk", "ws_ship_date_sk")

    val basePromo = session.read.parquet(tmpDir+"/promotion")
      // project only required columns
      .drop("p_channel_dmail","p_channel_email","p_channel_catalog","p_channel_tv","p_channel_radio",
        "p_channel_press","p_channel_event","p_channel_demo","p_channel_details","p_item_sk", "p_start_date_sk", "p_end_date_sk",
        "p_discount_active")

    val baseItem = session.read.parquet(tmpDir+"/item")
      // project only required columns
      .drop("i_rec_start_date","i_rec_end_date","i_class_id","i_manufact_id",
        "i_formulation","i_manager_id","i_current_price","i_wholesale_cost","i_category_id","i_brand_id")

    val baseStore = session.read.parquet(tmpDir+"/store")
      // project only required columns
      .drop("s_rec_start_date","s_rec_end_date","s_closed_date_sk","s_geography_class",
        "s_market_desc","s_division_id","s_division_name","s_company_id","s_company_name","s_suite_number")

    val baseWarehouse = session.read.parquet(tmpDir+"/warehouse")
      // project only required columns
      .drop("w_suite_number")

    val shipMode = session.read.parquet(tmpDir+"/ship_mode")
        .drop("sm_ship_mode_sk","sm_contract")

    Map("warehouse" -> baseWarehouse,
      "store" -> baseStore,
      "item" -> baseItem,
      "promo" -> basePromo,
      "webSale" -> baseWebSale,
      "storeSale" -> baseStoreSale,
      "customerAddress" -> baseCustomerAddress,
      "customer" -> baseCustomer,
      "shipMode" -> shipMode
    )
  }

  def generateStoreChannelData( baseData: Map[String, Dataset[Row]]): Map[String, Dataset[Row]]= {

    println("generating store channel data.......................")

    val storeSale = baseData("storeSale")
      .addSaleRandomTimestamp("ss_ticket_number","ss_item_sk", startDatetime, endDatetime)
      .add30minProcessingTimestamp("long")
      .withColumnRenamed("ss_ticket_number", "ss_ticket_id")
      .join(baseData("store").select("s_store_sk","s_store_id"), $"ss_store_sk" === $"s_store_sk")
      .join(baseData("promo").select("p_promo_sk","p_promo_id"), $"ss_promo_sk" === $"p_promo_sk")
      .join(baseData("customer").select("c_customer_sk","c_customer_id"), $"ss_customer_sk" === $"c_customer_sk")
    storeSale.persist()

    val item = storeSale.select("sale_datetime", "processing_datetime","ss_item_sk")
      .join(baseData("item"), $"ss_item_sk"===$"i_item_sk")
      .addPastRandomTimestampAndDedup("i_item_sk","item_datetime",startDatetime,"sale_datetime")
      .withColumnRenamed("ss_item_sk", "ss_item_id").drop("i_item_id")
      .cleanColumnNames("")

    val store = storeSale.select("sale_datetime","processing_datetime","ss_store_sk")
      .join(baseData("store"), $"ss_store_sk"===$"s_store_sk")
      .concatStreetAddress("street", "s_street_number", "s_street_name", "s_street_type")
      .addPastRandomTimestampAndDedup("s_store_sk","store_datetime", startDatetime,"sale_datetime")
      .withColumnRenamed("s_tax_precentage", "tax_percentage")
      .cleanColumnNames("")

    val promo = storeSale.select("sale_datetime","processing_datetime","ss_promo_sk")
      .join(baseData("promo"), $"ss_promo_sk"===$"p_promo_sk")
      .addPastRandomTimestampAndDedup("p_promo_sk","promo_datetime",startDatetime,"sale_datetime")
      .addPastRandomTimestamp("start_datetime", startDatetime, "sale_datetime")
      .addFutureRandomTimestamp("end_datetime", endDatetime, "sale_datetime")
      .cleanColumnNames("")

    val customer = storeSale.select("sale_datetime","processing_datetime","ss_customer_sk")
      .join(baseData("customer"), $"ss_customer_sk"===$"c_customer_sk")
      .addPastRandomTimestampAndDedup("c_customer_sk","customer_datetime",startDatetime, "sale_datetime")
      .join(baseData("customerAddress").select("ca_address_sk","ca_address_id"), $"c_current_addr_sk" === $"ca_address_sk")
      .concatdBirthDate()
      .addCustomerAndHouseholdDemo(tmpDir)
      .cleanColumnNames("")
    customer.persist()

    val customerAddress = customer.select("customer_datetime","processing_datetime","current_addr_sk")
      .join(baseData("customerAddress"), $"current_addr_sk" === $"ca_address_sk")
      .addPastRandomTimestampAndDedup("ca_address_sk","address_datetime",startDatetime, "customer_datetime")
      .concatStreetAddress("street", "ca_street_number", "ca_street_name", "ca_street_type")
      .cleanColumnNames("")

    val redressedStoreSale = storeSale.withColumnRenamed("ss_item_sk", "ss_item_id").cleanColumnNames("").redressRevenues()

    Map("store" -> store,
      "item" -> item,
      "promo" -> promo,
      "storeSale" -> redressedStoreSale,
      "customerAddress" -> customerAddress,
      "customer" -> customer
    )
  }

  def generateWebChannelData( baseData: Map[String, Dataset[Row]]): Map[String, Dataset[Row]]= {

    println("generating web channel data........................")
    val webSale = baseData("webSale")
      .addSaleRandomTimestamp("ws_order_number", "ws_item_sk", startDatetime, endDatetime)
      .add30minProcessingTimestamp("long")
      .withColumnRenamed("ws_order_number", "ws_order_id")
      .join(baseData("warehouse").select("w_warehouse_sk","w_warehouse_id"), $"ws_warehouse_sk" === $"w_warehouse_sk")
      .join(baseData("promo").select("p_promo_sk","p_promo_id"), $"ws_promo_sk" === $"p_promo_sk")
      .join(baseData("customer").select($"c_customer_sk",$"c_customer_id".as("bill_customer_id")), $"ws_bill_customer_sk" === $"c_customer_sk")
      .drop("c_customer_sk")
      .join(baseData("customer").select($"c_customer_sk",$"c_customer_id".as("ship_customer_id")), $"ws_ship_customer_sk" === $"c_customer_sk")
      .join(session.read.parquet(tmpDir+"/ship_mode"), $"ws_ship_mode_sk" === $"sm_ship_mode_sk")
      .withColumnRenamed("sm_type","sm_ship_delay")
      .withColumnRenamed("sm_code","sm_ship_mode")
      .withColumnRenamed("sm_carrier","sm_ship_carrier")
      .drop("sm_ship_mode_sk","ws_ship_mode_sk", "sm_ship_mode_id")
    webSale.persist()

    val item = webSale.select("sale_datetime", "processing_datetime","ws_item_sk")
      .join(baseData("item"), $"ws_item_sk"===$"i_item_sk")
      .addPastRandomTimestampAndDedup("i_item_sk","item_datetime",startDatetime,"sale_datetime")
      .withColumnRenamed("ws_item_sk", "ws_item_id").drop("i_item_id")
      .cleanColumnNames("")

    val warehouse = webSale.select("sale_datetime","processing_datetime","ws_warehouse_sk")
      .join(baseData("warehouse"), $"ws_warehouse_sk"===$"w_warehouse_sk")
      .concatStreetAddress("street", "w_street_number", "w_street_name", "w_street_type")
      .addPastRandomTimestampAndDedup("w_warehouse_sk","warehouse_datetime", startDatetime,"sale_datetime")
      .cleanColumnNames("")

    val promo = webSale.select("sale_datetime","processing_datetime","ws_promo_sk")
      .join(baseData("promo"), $"ws_promo_sk"===$"p_promo_sk")
      .addPastRandomTimestampAndDedup("p_promo_sk","promo_datetime",startDatetime,"sale_datetime")
      .addPastRandomTimestamp("start_datetime", startDatetime, "sale_datetime")
      .addFutureRandomTimestamp("end_datetime", endDatetime, "sale_datetime")
      .cleanColumnNames("")

    val customer = webSale.select("sale_datetime","processing_datetime","ws_bill_customer_sk","ws_ship_customer_sk")
      .join(baseData("customer"), $"ws_bill_customer_sk"===$"c_customer_sk"
      || $"ws_bill_customer_sk"===$"c_customer_sk" )
      .addPastRandomTimestampAndDedup("c_customer_sk","customer_datetime",startDatetime, "sale_datetime")
      .join(baseData("customerAddress").select("ca_address_sk","ca_address_id"), $"c_current_addr_sk" === $"ca_address_sk")
      .concatdBirthDate()
      .addCustomerAndHouseholdDemo(tmpDir)
      .cleanColumnNames("")
    customer.persist()

    val customerAddress = customer.select("customer_datetime","processing_datetime","current_addr_sk")
      .join(baseData("customerAddress"), $"current_addr_sk" === $"ca_address_sk")
      .addPastRandomTimestampAndDedup("ca_address_sk","address_datetime",startDatetime, "customer_datetime")
      .concatStreetAddress("street", "ca_street_number", "ca_street_name", "ca_street_type")
      .cleanColumnNames("")

    val redressedWebSale = webSale.withColumnRenamed("ws_item_sk", "ws_item_id").cleanColumnNames("").redressRevenues()

    Map("warehouse" -> warehouse,
      "item" -> item,
      "promo" -> promo,
      "webSale" -> redressedWebSale,
      "customerAddress" -> customerAddress,
      "customer" -> customer
    )
  }

  def generateModuleData(): Unit
}
