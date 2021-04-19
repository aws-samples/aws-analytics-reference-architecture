// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

name := "data-generator"

version := "v1.0"

//lazy val root = Project("root", file(".")) dependsOn(sparkSqlPerf)
//lazy val sparkSqlPerf = ProjectRef(uri("https://github.com/vgkowski/spark-sql-perf.git"), "spark-sql-perf")

lazy val root = (project in file(".")).dependsOn(sparkSqlPerf)
lazy val sparkSqlPerf = RootProject(uri("https://github.com/vgkowski/spark-sql-perf.git"))

scalaVersion := "2.11.12"

// additional librairies
libraryDependencies ++= {
  Seq(
    "org.apache.spark" %% "spark-core" % "2.4.6" % "provided",
    "org.apache.spark" %% "spark-sql" % "2.4.6" % "provided",
    "org.scalactic" %% "scalactic" % "3.0.7",
    "org.scalatest" %% "scalatest" % "3.0.7" % Test
  )
}

//assemblyShadeRules in assembly := Seq(
//  ShadeRule.rename("org.apache.spark.unused.UnusedStubClass" -> "shaded.Unused").inLibrary("org.spark-project.spark" % "unused" % "1.0.0"),
//)

sparkVersion := "2.4.6"

sparkComponents ++= Seq("sql", "hive", "mllib")

// testing configuration for Spark-testing-base package
fork in Test := true
javaOptions ++= Seq("-Xms6G", "-Xmx6G", "-XX:+CMSClassUnloadingEnabled")
parallelExecution in Test := false
