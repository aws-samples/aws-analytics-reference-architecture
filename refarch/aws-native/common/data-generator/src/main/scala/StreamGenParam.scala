// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

case class StreamGenParam(
                          name: String ="websales",
                          tmpDir: String = "src/test/resources/tmp",
                          targetStream : String = "",
                          parallelism : Int = 2,
                          streamCheckpoint : String = "",
                          region: String = "eu-west-1"
                   ){
  require(parallelism>0)
  require(name.matches("(?:web-sale|web-customer|web-customer-address)"))
  require(region.matches("(us(-gov)?|ap|ca|cn|eu|sa)-(central|(north|south)?(east|west)?)-\\d"))
}
