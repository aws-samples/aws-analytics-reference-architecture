// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { App, Stack, RemovalPolicy } from '@aws-cdk/core';
import { Key } from '@aws-cdk/aws-kms';
import { Bucket } from '@aws-cdk/aws-s3';
import { S3CrossAccount } from './s3-cross-account';

const integTestApp = new App();
const stack = new Stack(integTestApp, 'S3CrossAccountE2eTest');

const accountId = '1111111111111';
const myKey = new Key(stack, 'MyKey', {
  removalPolicy: RemovalPolicy.DESTROY,
});
const myBucket = new Bucket(stack, 'MyBucket', {
    encryptionKey: myKey,
    removalPolicy: RemovalPolicy.DESTROY,
    autoDeleteObjects: true,
});

new S3CrossAccount(stack, 'MyS3CrossAccount', {
  bucket: myBucket,
  objectKey: 'test',
  key: myKey,
  accountID: accountId
});