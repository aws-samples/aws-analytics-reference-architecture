// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

case class DataGenParam(module: String = "dwh",
                    dsdgenDir : String = "src/test/resources/dsdgen",
                    tmpDir: String = "src/test/resources/tmp",
                    targetDir : String = "src/test/resources/results",
                    scaleFactor : Int = 1,
                    fileFormat : String = "csv",
                    parallelism : Int = 4,
                    partitionedOutput : Boolean = false,
                    singleFileOutput : Boolean = true,
                    iteration : Int=0,
                    startDatetime : String = "2020-01-01T00:00:00",
                    endDatetime : String = "2020-01-02T00:00:00",
                    streamSource: String = "src/test/resources/results/stream_source"
                   ){
  require(scaleFactor>0)
  require(parallelism>0)
  require(module.matches("(?:dwh|stream|batch)"))
  require(startDatetime.matches("^\\d{4}-\\d{2}-\\d{2}T(2[0-3]|[01][0-9]):?([0-5][0-9]):?([0-5][0-9])$"))
  require(endDatetime.matches("^\\d{4}-\\d{2}-\\d{2}T(2[0-3]|[01][0-9]):?([0-5][0-9]):?([0-5][0-9])$"))
}
