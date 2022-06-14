// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests DataProduct
 *
 * @group unit/best-practice/data-product
 */

import { Annotations, Match } from 'aws-cdk-lib/assertions';
import { Key } from 'aws-cdk-lib/aws-kms';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { App, Aws, RemovalPolicy, Stack, Aspects } from 'aws-cdk-lib';
// eslint-disable-next-line import/no-extraneous-dependencies,import/no-unresolved
import { AwsSolutionsChecks, NagSuppressions } from 'cdk-nag';
import { DataProduct } from '../../../src/data-mesh';


const mockApp = new App();

const dataProductStack = new Stack(mockApp, 'dataProduct');

const myKey = new Key(dataProductStack, 'MyKey', {
  removalPolicy: RemovalPolicy.DESTROY,
});

const myBucket = new Bucket(dataProductStack, 'MyBucket', {
  encryptionKey: myKey,
  removalPolicy: RemovalPolicy.DESTROY,
  autoDeleteObjects: true,
});

new DataProduct(dataProductStack, 'MyDataProduct', {
  crossAccountAccessProps: {
    s3Bucket: myBucket,
    s3ObjectKey: 'test',
    accountId: Aws.ACCOUNT_ID,
  }
})

Aspects.of(dataProductStack).add(new AwsSolutionsChecks());

NagSuppressions.addResourceSuppressionsByPath(
  dataProductStack,
  'dataProduct/MyKey/Resource',
  [{ id: 'AwsSolutions-KMS5', reason: 'The key is not part of tested resources' }],
);

NagSuppressions.addResourceSuppressionsByPath(
  dataProductStack,
  'dataProduct/MyBucket/Resource',
  [
    { id: 'AwsSolutions-S1', reason: 'The bucket access log is outside the scope of the DataProduct' },
    { id: 'AwsSolutions-S2', reason: 'The bucket public access is outside the scope of the DataProduct' },
    { id: 'AwsSolutions-S10', reason: 'The bucket SSL is outside the scope of the DataProduct' },
  ],
);

NagSuppressions.addResourceSuppressionsByPath(
  dataProductStack,
  'dataProduct/MyBucket/Policy/Resource',
  [
    { id: 'AwsSolutions-S10', reason: 'The bucket SSL is outside the scope of the DataProduct' },
  ],
);

test('No unsuppressed Warnings', () => {
  const warnings = Annotations.fromStack(dataProductStack).findWarning('*', Match.stringLikeRegexp('AwsSolutions-.*'));
  console.log(warnings);
  expect(warnings).toHaveLength(0);
});

test('No unsuppressed Errors', () => {
  const errors = Annotations.fromStack(dataProductStack).findError('*', Match.stringLikeRegexp('AwsSolutions-.*'));
  console.log(errors);
  expect(errors).toHaveLength(0);
});

