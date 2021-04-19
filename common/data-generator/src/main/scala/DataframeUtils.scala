// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import org.apache.spark.sql.{Dataset, Row}
import java.time.Instant

import org.apache.spark.sql.expressions.Window
import org.apache.spark.sql.functions._
import org.apache.spark.sql.types.DecimalType

object DataframeUtils {
  implicit def dfToDfUtils( df : Dataset[Row]) = new DataframeUtils(df)
}

class DataframeUtils(df : Dataset[Row]){

  import df.sparkSession.implicits._

  def cleanColumnNames(prefix : String): Dataset[Row] ={
    val newCols = df.columns.toSeq.map(n => n.replaceFirst("^[a-z]{1,2}_",prefix)).toArray
    df.toDF(newCols : _*)
  }

  def addRandomTimestamp(columnName: String, startDate: String, endDate: String): Dataset[Row] = {
    val startEpoch = Instant.parse(startDate+".000Z").getEpochSecond
    val endEpoch = Instant.parse(endDate+".000Z").getEpochSecond - 1
    df.withColumn(columnName, (lit(startEpoch) + rand() * (endEpoch-startEpoch)).cast("timestamp"))
  }

  def addSaleRandomTimestamp(groupColumnName: String, itemColumn: String, startDate: String, endDate: String): Dataset[Row] = {
    import DataframeUtils._

    df.groupBy(groupColumnName)
      .agg(
        collect_list(
          struct(itemColumn,df.columns.filter(c => (c !=groupColumnName) && (c!=itemColumn)): _*)
        ).alias("items")
      )
      .addRandomTimestamp("sale_datetime",startDate, endDate)
      .select(df(groupColumnName),$"sale_datetime",explode($"items") as "item")
      .select(df(groupColumnName),$"sale_datetime", $"item.*")
  }

  def addPastRandomTimestampAndDedup(groupColumnName: String, columnName: String, startDate: String,endDateColumn: String ): Dataset[Row] = {
    val startEpoch = Instant.parse(startDate+".000Z").getEpochSecond
    val winSpec = Window.partitionBy(groupColumnName).orderBy(col(endDateColumn).asc)

    df.withColumn("rank", row_number().over(winSpec))
      .filter($"rank" === 1)
      .drop("rank")
      .withColumn(columnName, (lit(startEpoch) + rand() * (col(endDateColumn).cast("long")-1-startEpoch)).cast("timestamp"))
  }

  def addPastRandomTimestamp(columnName: String, startDate: String, endDateColumn: String ): Dataset[Row] = {
    val startEpoch = Instant.parse(startDate+".000Z").getEpochSecond

    df.withColumn(columnName, (lit(startEpoch) + rand() * (col(endDateColumn).cast("long")-1-startEpoch)).cast("timestamp"))
  }

  def addFutureRandomTimestamp(columnName: String, endDate: String, startDateColumn: String ): Dataset[Row] = {
    val endEpoch = Instant.parse(endDate+".000Z").getEpochSecond

    df.withColumn(columnName, (lit(endEpoch) + rand() * (col(startDateColumn).cast("long")+1-endEpoch)).cast("timestamp"))
  }

  def addHourProcessingTimestamp(columnType: String) : Dataset[Row] = {
    df.withColumn("processing_datetime", (floor(unix_timestamp() / 3600) * 3600).cast(columnType))
  }

  def add30minProcessingTimestamp(columnType: String) : Dataset[Row] = {
    df.withColumn("processing_datetime", (floor(unix_timestamp() / 1800) * 1800 ).cast(columnType))
  }

  def addCustomerAndHouseholdDemo(tmpDir: String): Dataset[Row] = {
    import DataframeUtils._

    val baseCustomerDemo = df.sparkSession.read.parquet(tmpDir+"/customer_demographics")
      // project only required columns
      .drop("cd_dep_count","cd_dep_employed_count","cd_dep_college_count")

    val baseHouseholdDemo = df.sparkSession.read.parquet(tmpDir+"/household_demographics")
      // project only required columns
      .drop("hd_dep_count")
      // join with income band to flatten entities
      .join(df.sparkSession.read.parquet(tmpDir+"/income_band"),$"hd_income_band_sk" === $"ib_income_band_sk")
      // drop IDs used for the join
      .drop("hd_income_band_sk","ib_income_band_sk")

    df.join(baseCustomerDemo, $"c_current_cdemo_sk" === $"cd_demo_sk").drop("c_current_cdemo_sk","cd_demo_sk")
      .join(baseHouseholdDemo,$"c_current_hdemo_sk" === $"hd_demo_sk").drop("c_current_hdemo_sk","hd_demo_sk")
  }

  def concatStreetAddress(addressColName: String, streetNumberColName: String, streetNameColName: String, streetTypeColName: String ): Dataset[Row] = {
    df.withColumn(addressColName, concat(col(streetNumberColName), lit(" "), col(streetNameColName), lit(" "), col(streetTypeColName)))
      .drop(streetNumberColName,streetTypeColName,streetNameColName)
  }

  def concatdBirthDate(): Dataset[Row] = {
    df.withColumn("c_birth_date",to_date(concat(format_string("%02d",$"c_birth_month"),
      format_string("%02d",$"c_birth_day"),
      format_string("%02d",$"c_birth_year")),"MMddyyyy"))
      .drop("c_birth_month","c_birth_day","c_birth_year")
  }

  def redressRevenues(): Dataset[Row] = df.withColumn("sales_price", (col("wholesale_cost") + col("coupon_amt")/col("quantity") + rand * ((col("list_price")-col("wholesale_cost"))/10)).cast(DecimalType(7,2)))
    .withColumn("ext_sales_price", (col("sales_price") * col("quantity")).cast(DecimalType(7,2)))
    .withColumn("net_paid", (col("ext_sales_price") - col("coupon_amt")).cast(DecimalType(7,2)))
    .withColumn("net_paid_inc_tax", (col("net_paid") + col("ext_tax")).cast(DecimalType(7,2)))
    .withColumn("net_profit", (col("net_paid") - col("ext_wholesale_cost")).cast(DecimalType(7,2)))
}
