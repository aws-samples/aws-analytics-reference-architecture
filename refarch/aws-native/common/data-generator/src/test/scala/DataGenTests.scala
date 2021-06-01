// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0


import org.scalatest.{BeforeAndAfterAll, Suites}

import scala.reflect.io.Path
import scala.util.Try
import java.io._
import java.nio.file.Paths

import scala.sys.process._
import org.apache.log4j.Logger
import org.apache.log4j.Level


class DataGenTests extends Suites(new BaseDataTest, new BatchModuleDataTest, new DwhModuleDataTest, new StreamingModuleDataTest, new DataframeUtilsTest) with BeforeAndAfterAll {

  import TestUtils._

  override def beforeAll(): Unit = {
    Logger.getLogger("org").setLevel(Level.WARN)
    Logger.getLogger("akka").setLevel(Level.OFF)
    if (!Path(param.dsdgenDir).exists) { println("dsdgen not present, installing..."); installDSDGEN() }
    if (!Path(param.tmpDir).exists) { println("base data not present, generating..."); new BatchModuleData(param,spark).generateBaseData()  }
    super.beforeAll()
  }

  override def afterAll(): Unit = {
    spark.close()
    Try(Path("src/test/resources/results").deleteRecursively)
    Try(Path("src/test/resources/dsdgen.sh").delete)
    super.afterAll()
  }

  def installDSDGEN(url: String = "https://github.com/vgkowski/tpcds-kit.git", baseFolder: String = "src/test/resources") = {

    Seq("mkdir", "-p", baseFolder).!
    val pw = new PrintWriter(new File(s"${baseFolder}/dsdgen.sh" ))

    pw.write(generateDsdgenInstallScript(url,baseFolder))
    pw.close
    Seq("chmod", "+x", s"${baseFolder}/dsdgen.sh").!
    println(Seq(s"${baseFolder}/dsdgen.sh").!!)
  }

  def generateDsdgenInstallScript(url: String = "https://github.com/vgkowski/tpcds-kit.git", baseFolder: String = "src/test/resources"): String = {

    val folder = if (!baseFolder.startsWith("/")) Paths.get(".").toAbsolutePath + "/" + baseFolder else baseFolder
    var preInstall = ""
    var os = ""
    System.getProperty("os.name") match {
      case "Mac OS X" =>
        preInstall = s"""xcode-select --install
                        |""".stripMargin
        os = "MACOS"
      case "Linux" =>
        preInstall = s"""sudo yum update
                        |sudo yum install -y gcc make flex bison byacc git
                        |""".stripMargin
        os = "LINUX"
    }
    val fileContent = s"""rm -rf ${folder}/dsdgen
                         |echo $$(pwd)
                         |rm -rf ${folder}/dsdgen_install
                         |mkdir ${folder}/dsdgen_install
                         |mkdir ${folder}/dsdgen
                         |cd ${folder}/dsdgen_install
                         |git clone '$url'
                         |cd tpcds-kit/tools
                         |make OS=${os}
                         |mv ${folder}/dsdgen_install/tpcds-kit/tools/* ${folder}/dsdgen/
                         |${folder}/dsdgen/dsdgen -h
                         |test -e ${folder}/dsdgen/dsdgen
                         |echo "OK"
                         |rm -rf ${folder}/dsdgen_install""".stripMargin
    preInstall + fileContent
  }
}