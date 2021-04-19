// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import org.scalatest.{BeforeAndAfter, BeforeAndAfterAll, DoNotDiscover, FunSuite}

import scala.reflect.io.Path
import java.io.File

@DoNotDiscover
class BaseDataTest extends FunSuite {

  import TestUtils._

  val tableList= List(
    "customer",
    "customer_address",
    "customer_demographics",
    "date_dim",
    "household_demographics",
    "income_band",
    "item",
    "promotion",
    "ship_mode",
    "store",
    "store_sales",
    "warehouse",
    "web_sales"
  ).map(param.tmpDir+"/"+_)

  test("GenerateBaseData should generate the right base tables") {
    assert(!(!tableList.forall(Path(_).exists)))
  }
  test("GenerateBaseData should generate valid parquet files") {
    tableList.flatMap(new File(_).listFiles.filter(_.isFile).toList)
  }
}
