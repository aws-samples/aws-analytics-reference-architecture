// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import java.time.temporal.ChronoUnit
import java.time.{Instant, ZonedDateTime}

import org.apache.spark.sql.types.{DateType, LongType, StringType, TimestampType}
import org.apache.spark.sql.{Dataset, Row}
import org.scalatest.{DoNotDiscover, FunSuite, fixture}
import org.apache.spark.sql.functions._

import scala.util.Try


class DataframeUtilsTest extends fixture.FunSuite {

  import TestUtils._
  import DataframeUtils._

  case class FixtureParam(df: Dataset[Row])

  override def withFixture(test: OneArgTest) = {
    import spark.implicits._
    val fix = FixtureParam(
      Seq(
        (8, "bat","1","1","2000","2nd","test","street", 18.19, 33.1, 94, 210.18, 35.89, 1709.86),
        (8,"dog","1","2","2000","1st","test","street", 86.25, 139.72, 27, 537.57, 64.5, 2328.75),
        (1,"cat","1","3","2000","3rd","test","street", 39.64, 56.68, 22, 0.0, 72.94, 872.08))
      .toDF("id", "item_sk", "c_birth_month", "c_birth_day", "c_birth_year","ca_street_number",
        "ca_street_name","ca_street_type", "wholesale_cost", "list_price", "quantity", "coupon_amt", "ext_tax", "ext_wholesale_cost"))
    withFixture(test.toNoArgTest(fix)) // Invoke the test function
  }

  test("CleanColumnNames should remove prefix from column names of a Dataframe") { fixture =>
    assert(fixture.df.cleanColumnNames("").columns.toSeq ==
      Seq("id", "item_sk", "birth_month", "birth_day", "birth_year", "street_number", "street_name", "street_type",
        "wholesale_cost", "list_price", "quantity", "coupon_amt", "ext_tax", "ext_wholesale_cost"))
  }

  test("addRandomTimestamp should add a random Timestamp column to a Dataframe within the interval") { fixture =>
    val df = fixture.df.addRandomTimestamp("datetime", "2020-01-01T00:00:00", "2020-01-02T00:00:00")
    df.cache
    val indexOfEventDateTime = df.columns.indexOf("datetime")
    val typeOfEventDateTime = Try(df.schema.fields(indexOfEventDateTime).dataType).getOrElse(null)
    assert(indexOfEventDateTime > -1 && typeOfEventDateTime == TimestampType)

    val startEpoch = Instant.parse("2020-01-01T00:00:00.000Z")
    val endEpoch = Instant.parse("2020-01-02T00:00:00.000Z")
    val result = df.select("datetime").collect()(0).getTimestamp(0).toInstant
    assert(result.compareTo(startEpoch) >= 0 && result.compareTo(endEpoch) <= 0)
    df.unpersist
  }

  test("addHourProcessingTimestamp should add a processing timestamp column with current datetime rounded to the hour and with the right type") { fixture =>
    val df = fixture.df.addHourProcessingTimestamp("timestamp")
    val indexOfEventDateTime = df.columns.indexOf("processing_datetime")
    val typeOfEventDateTime = Try(df.schema.fields(indexOfEventDateTime).dataType).getOrElse(null)
    assert(indexOfEventDateTime > -1)
    assert(typeOfEventDateTime == TimestampType)

    val result = df.select("processing_datetime").collect()(0).getTimestamp(0).toInstant
    assert( result == Instant.now().truncatedTo(ChronoUnit.HOURS))

    val df2 = fixture.df.addHourProcessingTimestamp("long")
    val indexOfEventEpoch = df2.columns.indexOf("processing_datetime")
    val typeOfEventEpoch = Try(df2.schema.fields(indexOfEventEpoch).dataType).getOrElse(null)
    assert(typeOfEventEpoch == LongType)
  }

  test("add30minProcessingTimestamp should add a processing timestamp column with current datetime rounded to the previous 30min and with the right type") { fixture =>
    val flooredTimestamp = Instant.ofEpochSecond((ZonedDateTime.now().toEpochSecond / 1800).floor.toLong * 1800)
    val df = fixture.df.add30minProcessingTimestamp("timestamp")
    val indexOfEventDateTime = df.columns.indexOf("processing_datetime")
    val typeOfEventDateTime = Try(df.schema.fields(indexOfEventDateTime).dataType).getOrElse(null)
    assert(indexOfEventDateTime > -1 && typeOfEventDateTime == TimestampType)

    val result = df.select("processing_datetime").collect()(0).getTimestamp(0).toInstant
    assert( flooredTimestamp.compareTo(result) == 0)

    val df2 = fixture.df.add30minProcessingTimestamp("long")
    val indexOfEventEpoch = df2.columns.indexOf("processing_datetime")
    val typeOfEventDateEpoch = Try(df2.schema.fields(indexOfEventEpoch).dataType).getOrElse(null)
    assert(typeOfEventDateEpoch == LongType)
  }

  test("addSaleRandomTimestamp should add the same random 'sale_datetime' to the group of row, should not modify the number of row and should keep the same columns") { fixture =>
    val df = fixture.df.addSaleRandomTimestamp("id", "item_sk", "2020-01-01T00:00:00", "2020-01-02T00:00:00")
    df.cache
    val indexOfEventDateTime = df.columns.indexOf("sale_datetime")
    val typeOfEventDateTime = Try(df.schema.fields(indexOfEventDateTime).dataType).getOrElse(null)
    assert(indexOfEventDateTime > -1 && typeOfEventDateTime == TimestampType)

    assert(df.groupBy("id").agg(countDistinct("sale_datetime").as("count")).select("count").collect()(0).getLong(0) == 1)
    assert(df.count == fixture.df.count)
    assert(df.columns.filter(_ != "sale_datetime").sameElements(fixture.df.columns))
    df.unpersist
  }

  test("addPastRandomTimestampAndDedup should add a random timestamp that is in the past from the minimum " +
    "of the groupColumn, should keep the same columns and dedup the rows based on the groupColumn") { fixture =>
    val baseDF = fixture.df.addRandomTimestamp("sale_datetime",  "2020-01-01T00:00:00", "2020-01-02T00:00:00")
    baseDF.cache()
    val df = baseDF.addPastRandomTimestampAndDedup("id", "past_datetime","2020-01-01T00:00:00","sale_datetime" )
    df.cache()

    val indexOfEventDateTime = Try(df.schema.fieldIndex("past_datetime")).getOrElse(-1)
    val typeOfEventDateTime = Try(df.schema.fields(indexOfEventDateTime).dataType).getOrElse(null)
    assert(indexOfEventDateTime > -1 && typeOfEventDateTime == TimestampType)

    assert(df.filter("id == 8").select("past_datetime").collect()(0).getTimestamp(0).compareTo(baseDF.filter("id == 8").groupBy("id").agg(min("sale_datetime").as("min")).select("min").collect()(0).getTimestamp(0)) == -1)
    assert(df.count == baseDF.dropDuplicates("id").count)
    assert(df.columns.filter( x => (x != "sale_datetime" && x != "past_datetime")).sameElements(fixture.df.columns))
    baseDF.unpersist()
    df.unpersist()
  }

  test("addPastRandomTimestamp should add a random timestamp that is in the past from the reference column and should keep the same columns") { fixture =>
    val df = fixture.df.addRandomTimestamp("sale_datetime",  "2020-01-01T00:00:00", "2020-01-02T00:00:00")
      .addPastRandomTimestamp("past_datetime","2020-01-01T00:00:00", "sale_datetime" )
    df.cache()
    val indexOfEventDateTime = df.columns.indexOf("past_datetime")
    val typeOfEventDateTime = Try(df.schema.fields(indexOfEventDateTime).dataType).getOrElse(null)
    assert(indexOfEventDateTime > -1 && typeOfEventDateTime == TimestampType)

    assert(df.select("past_datetime").collect()(0).getTimestamp(0).compareTo(df.select("sale_datetime").collect()(0).getTimestamp(0)) == -1)
    assert(df.count == fixture.df.count)
    assert(df.columns.filter( x => (x != "sale_datetime" && x != "past_datetime")).sameElements(fixture.df.columns))
    df.unpersist()
  }

  test("addFutureRandomTimestamp should add a random timestamp that is in the future from the reference column and should keep the same columns") { fixture =>
    val df = fixture.df.addRandomTimestamp("sale_datetime",  "2020-01-01T00:00:00", "2020-01-02T00:00:00")
      .addFutureRandomTimestamp("future_datetime","2020-01-02T00:00:00","sale_datetime" )
    df.cache()
    val indexOfEventDateTime = df.columns.indexOf("future_datetime")
    val typeOfEventDateTime = Try(df.schema.fields(indexOfEventDateTime).dataType).getOrElse(null)
    assert(indexOfEventDateTime > -1 && typeOfEventDateTime == TimestampType)

    assert(df.select("future_datetime").collect()(0).getTimestamp(0).compareTo(df.select("sale_datetime").collect()(0).getTimestamp(0)) == 1)
    assert(df.count == fixture.df.count)
    assert(df.columns.filter( x => (x != "sale_datetime" && x != "future_datetime")).sameElements(fixture.df.columns))
    df.unpersist()
  }

  test("concatBirthDate should build a full birth date 'c_birth_date' in date format from 'c_birth_day', 'c_birth_month', 'c_birth_year'") {fixture =>
    val df = fixture.df.concatdBirthDate()
    val indexOfEventDateTime = df.columns.indexOf("c_birth_date")
    val typeOfEventDateTime = Try(df.schema.fields(indexOfEventDateTime).dataType).getOrElse(null)
    assert(indexOfEventDateTime > -1 && typeOfEventDateTime == DateType)
    assert(df.columns.filter( x => x == "c_birth_day" || x == "c_birth_month" || x == "c_birth_year").isEmpty)
  }

  test("concatStreetAddress should build a full street 'ca_street' column in string format from 'ca_street_number', 'ca_street_name', 'ca_street_type'") {fixture =>
    val df = fixture.df.concatStreetAddress("ca_street", "ca_street_number", "ca_street_name", "ca_street_type")
    val indexOfEventDateTime = df.columns.indexOf("ca_street")
    val typeOfEventDateTime = Try(df.schema.fields(indexOfEventDateTime).dataType).getOrElse(null)
    assert(indexOfEventDateTime > -1 && typeOfEventDateTime == StringType)
    assert(df.columns.filter( x => x == "ca_street_number" || x == "ca_street_name" || x == "ca_street_type").isEmpty)
    assert(df.select("ca_street").collect()(0).getString(0) == "2nd test street")
  }

  test("redressRevenues should provide positive revenues") {fixture =>
    val df = fixture.df.redressRevenues()
    df.show()
    assert(!df.select("net_profit").collect().map(_.getDecimal(0).doubleValue() > 0.0).contains(false))
  }
}