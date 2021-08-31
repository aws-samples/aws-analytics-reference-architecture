/**
 *  This lambda requires openssl so make sure you have lambda layer that has it installed.
 */

import {
  EMRContainersClient,
  CreateManagedEndpointCommand,
  CreateManagedEndpointCommandOutput,
  DeleteManagedEndpointCommand,
  DeleteManagedEndpointCommandOutput,
  DescribeManagedEndpointCommand,
  DescribeManagedEndpointCommandOutput,
  EndpointState,
} from "@aws-sdk/client-emr-containers";

import {
  ACMClient,
  ImportCertificateCommand,
  ImportCertificateCommandOutput,
  ListCertificatesCommand,
} from "@aws-sdk/client-acm";

import { execSync } from "child_process";
import { readFileSync } from "fs";

const client = new EMRContainersClient({
  region: process.env.REGION ?? "us-east-1",
});

const CONFIGURATION_OVERRIDES_DEFAULT = {
  applicationConfiguration: [
    {
      classification: "spark-defaults",
      properties: {
        "spark.hadoop.hive.metastore.client.factory.class":
          "com.amazonaws.glue.catalog.metastore.AWSGlueDataCatalogHiveClientFactory",
        "spark.sql.catalogImplementation": "hive",
      },
    },
  ],
  monitoringConfiguration: {
    persistentAppUI: "ENABLED",
    cloudWatchMonitoringConfiguration: {
      logGroupName: "/emr-containers",
      logStreamNamePrefix: "emrmanagedendpoint",
    },
  },
};

export async function onEvent(event: any) {
  let command = null;

  switch (event.RequestType) {
    case "Create":
      //create
      const certArn = await getOrCreateCertificate();
      command = new CreateManagedEndpointCommand({
        virtualClusterId: process.env.CLUSTER_ID,
        certificateArn: certArn,
        executionRoleArn: process.env.EXECUTION_ROLE_ARN,
        configurationOverrides: process.env.CONFIGURATION_OVERRIDES
          ? JSON.parse(process.env.CONFIGURATION_OVERRIDES)
          : CONFIGURATION_OVERRIDES_DEFAULT,
        releaseLabel: process.env.RELEASE_LABEL,
        name: process.env.ENDPOINT_NAME,
        type: "JYPITER_ENTERPRISE_GATEWAY",
      });
      try {
        const data: CreateManagedEndpointCommandOutput = await client.send(
          command
        );
        return {
          PhysicalResourceId: data.id,
          Data: data,
        };
      } catch (error) {
        const { requestId, cfId, extendedRequestId, httpStatusCode } =
          error.$metadata;
        console.log({ requestId, cfId, extendedRequestId, httpStatusCode });
        return false;
      }
    case "Update":
      console.log("update not implemented");
      return {
        PhysicalResourceId: event.PhysicalResourceId,
        Data: event.ResourceProperties,
      };

    case "Delete":
      command = new DeleteManagedEndpointCommand({
        id: event.PhysicalResourceId,
        virtualClusterId: process.env.CLUSTER_ID,
      });
      try {
        const data: DeleteManagedEndpointCommandOutput = await client.send(
          command
        );

        return {
          PhysicalResourceId: data.id,
        };
      } catch (error) {
        const { requestId, cfId, extendedRequestId, httpStatusCode } =
          error.$metadata;
        console.log({ requestId, cfId, extendedRequestId, httpStatusCode });
        return false;
      }
  }
  return false;
}

export async function isComplete(event: any) {
  if (event.RequestType == "Delete") return { isComplete: true };

  const { virtualClusterId } = event.ResourceProperties;
  const endpoint_id = event.PhysicalResourceId;

  const command = new DescribeManagedEndpointCommand({
    id: endpoint_id,
    virtualClusterId: virtualClusterId,
  });
  try {
    const data: DescribeManagedEndpointCommandOutput = await client.send(
      command
    );
    if (!data.endpoint) return { isComplete: false };

    console.log(`current endpoint ${data.endpoint.id}`);

    switch (data.endpoint.state) {
      case EndpointState.ACTIVE:
        return { isComplete: true, Data: data.endpoint };
      case EndpointState.TERMINATED:
      case EndpointState.TERMINATED_WITH_ERRORS:
      case EndpointState.TERMINATING:
        throw new Error("managed endpoint failed to create");
      case EndpointState.CREATING:
        return { isComplete: false };
    }
  } catch (error) {
    const { requestId, cfId, extendedRequestId, httpStatusCode } =
      error.$metadata;
    console.log({ requestId, cfId, extendedRequestId, httpStatusCode });
    throw new Error("failed to describe managed endpoint");
  }
  return { isComplete: false };
}

export async function getOrCreateCertificate(): Promise<string | undefined> {
  const clientAcm = new ACMClient({});

  const getCerts = await clientAcm.send(
    new ListCertificatesCommand({
      MaxItems: 50,
      Includes: {
        keyTypes: ["RSA_1024"],
      },
    })
  );

  if (getCerts.CertificateSummaryList) {
    const existingCert = getCerts.CertificateSummaryList.find(
      (itm) => itm.DomainName == "*.emreksanalyticsframework.com"
    );

    if (existingCert) return existingCert.CertificateArn;
  }

  try {
    execSync(
      'openssl req -x509 -newkey rsa:1024 -keyout /tmp/privateKey.pem  -out /tmp/certificateChain.pem -days 365 -nodes -subj "/C=US/ST=Washington/L=Seattle/O=MyOrg/OU=MyDept/CN=*.emreksanalyticsframework.com"'
    );
  } catch (error) {
    throw new Error(`Error generating certificate ${error.message}`);
  }

  try {
    const command = new ImportCertificateCommand({
      Certificate: Buffer.from(
        readFileSync("file:///tmp/certificateChain.pem", "iso-8859-1")
      ),
      PrivateKey: Buffer.from(
        readFileSync("file:///tmp/privateKey.pem", "iso-8859-1")
      ),
    });
    const response: ImportCertificateCommandOutput = await clientAcm.send(
      command
    );
    return response.CertificateArn;
  } catch (error) {
    const { requestId, cfId, extendedRequestId, httpStatusCode } =
      error.$metadata;
    console.log({ requestId, cfId, extendedRequestId, httpStatusCode });
    throw new Error(`error importing certificate ${error.message}`);
  }
}
