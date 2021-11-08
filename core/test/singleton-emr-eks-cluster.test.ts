import * as assertCDK from '@aws-cdk/assert';
import { Stack } from '@aws-cdk/core';
import {
  DataPlatformNotebook,
  StudioAuthMode,
} from '../src/dataplatform-notebook';

const mutliDataplatformTest = new Stack();

new DataPlatformNotebook(mutliDataplatformTest, 'dataplatform-sso', {
  studioName: 'integration-test-sso',
  studioAuthMode: StudioAuthMode.SSO,
  eksAdminRoleArn: 'arn:aws:iam::012345678901:role/Admin',
  acmCertificateArn: 'arn:aws:acm:eu-west-1:012345678901:certificate/8a5dceb1-ee9d-46a5-91d2-7b4a1ea0b64d',
});

new DataPlatformNotebook(mutliDataplatformTest, 'dataplatform-iam', {
  studioName: 'integration-test-iam',
  studioAuthMode: StudioAuthMode.IAM_FEDERATED,
  eksAdminRoleArn: 'arn:aws:iam::012345678901:role/Admin',
  acmCertificateArn: 'arn:aws:acm:eu-west-1:012345678901:certificate/8a5dceb1-ee9d-46a5-91d2-7b4a1ea0b64d',
  idpAuthUrl: 'https://myapps.microsoft.com/signin/9b33f8d1-2cdd-4972-97a6-dedfc5a4bb38?tenantId=eb9c8428-db71-4fa4-9cc8-0a49d2c645c5',
  idPArn: 'arn:aws:iam::012345678901:saml-provider/AWS-ARA-Test',
});


test('EKS cluster created with correct version and name', () => {
  // THEN
  assertCDK.expect(mutliDataplatformTest).to(
    assertCDK.countResources('Custom::AWSCDK-EKS-Cluster', 1),
  );

  assertCDK.expect(mutliDataplatformTest).to(
    assertCDK.haveResource('Custom::AWSCDK-EKS-Cluster', {
      Config: assertCDK.objectLike({
        version: '1.20',
        name: 'ara-dataplatform-cluster',
      }),
    }),
  );
});
