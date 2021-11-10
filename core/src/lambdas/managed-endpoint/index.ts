// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import * as AWS from 'aws-sdk';

const emrcontainers = new AWS.EMRcontainers({
  apiVersion: '2020-10-01',
  region: process.env.REGION ?? 'us-east-1',
});

export async function onEvent(event: any) {
  switch (event.RequestType) {
    case 'Create':
    case 'Update':
      //create
      //const certArn = await getOrCreateCertificate();

      try {
        console.log(`lambda properties: ${JSON.stringify(event.ResourceProperties)}`);
        const response = await emrcontainers
          .createManagedEndpoint({
            clientToken: 'emr-managed-endpoint',
            virtualClusterId: event.ResourceProperties.clusterId,
            certificateArn: event.ResourceProperties.acmCertificateArn,
            executionRoleArn: event.ResourceProperties.executionRoleArn,
            configurationOverrides: JSON.parse(event.ResourceProperties.configurationOverrides || ''),
            releaseLabel: event.ResourceProperties.releaseLabel ?? 'emr-6.3.0-latest',
            name: event.ResourceProperties.endpointName,
            type: 'JUPYTER_ENTERPRISE_GATEWAY',
          })
          .promise();

        console.log(
          ` create managed endpoint ${response.id} ${response.name} ${response.virtualClusterId}`,
        );

        return {
          PhysicalResourceId: response.id,
        };
      } catch (error) {
        console.log(String(error));
        throw new Error(`error creating new managed endpoint ${error} `);
      }
      /*case 'Update':
      console.log('update not implemented');
      return {
        PhysicalResourceId: event.PhysicalResourceId,
        Data: event.ResourceProperties,
      };*/

    case 'Delete':
      try {
        const data = await emrcontainers
          .deleteManagedEndpoint({
            id: event.PhysicalResourceId,
            virtualClusterId: event.ResourceProperties.clusterId,
          })
          .promise();

        return {
          PhysicalResourceId: data.id,
        };
      } catch (error) {
        console.log(error);
        return false;
      }
  }
  return false;
}

export async function isComplete(event: any) {
  const requestType =
    event.RequestType == 'Delete' ? '_DELETE' : '_CREATEUPDATE';

  const endpoint_id = event.PhysicalResourceId;

  try {
    const data = await emrcontainers
      .describeManagedEndpoint({
        id: endpoint_id,
        virtualClusterId: event.ResourceProperties.clusterId,
      })
      .promise();
    if (!data.endpoint) return { IsComplete: false };

    console.log(`current endpoint ${data.endpoint.id}`);

    switch (data.endpoint.state + requestType) {
      case 'ACTIVE_CREATEUPDATE':
      case 'TERMINATED_DELETE':
        return { IsComplete: true, Data: data.endpoint };
      case 'TERMINATED_CREATEUPDATE':
      case 'TERMINATED_WITH_ERRORS_CREATEUPDATE':
      case 'TERMINATED_WITH_ERRORS_DELETE':
      case 'TERMINATING_CREATEUPDATE':
        throw new Error(
          `managed endpoint failed. Request=${data.endpoint.state} ${requestType}`,
        );
      default:
        return { IsComplete: false };
    }
  } catch (error) {
    console.log(error);
    throw new Error('failed to describe managed endpoint');
  }
}
/*
export async function getOrCreateCertificate(): Promise<string | undefined> {
  const clientAcm = new AWS.ACM(
    { apiVersion: '2015-12-08', region: process.env.REGION ?? 'us-east-1' },

  );

  const getCerts = await clientAcm.listCertificates({
    MaxItems: 50,
    Includes: {
      keyTypes: ['RSA_1024'],
    },
  },
  ).promise();

  if (getCerts.CertificateSummaryList) {
    const existingCert = getCerts.CertificateSummaryList.find(
      (itm) => itm.DomainName == '*.emreksanalyticsframework.com',
    );

    if (existingCert) return existingCert.CertificateArn;
  }

  try {
    execSync(
      'openssl req -x509 -newkey rsa:1024 -keyout /tmp/privateKey.pem  -out /tmp/certificateChain.pem -days 365 -nodes -subj "/C=US/ST=Washington/L=Seattle/O=MyOrg/OU=MyDept/CN=*.emreksanalyticsframework.com"',
    );
  } catch (error) {
    throw new Error(`Error generating certificate ${error.message}`);
  }

  try {
    const command = {
      Certificate: Buffer.from(
        readFileSync('file:///tmp/certificateChain.pem', 'iso-8859-1'),
      ),
      PrivateKey: Buffer.from(
        readFileSync('file:///tmp/privateKey.pem', 'iso-8859-1'),
      ),
    };
    const response = await clientAcm.importCertificate(
      command,
    ).promise();
    return response.CertificateArn;
  } catch (error) {
    console.log(error);
    throw new Error(`error importing certificate ${error.message}`);
  }
}*/
