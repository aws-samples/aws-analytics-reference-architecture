// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { Key } from '@aws-cdk/aws-kms';
import { Construct, Stack } from '@aws-cdk/core';

/**
 * An Amazon S3 Bucket implementing the singleton pattern
 */
export class SingletonKey extends Key {

  /**
     * Get the Amazon KMS Key the AWS CDK Stack based on the provided name.
     * If no key exists, it creates a new one.
     */
  public static getOrCreate(scope: Construct, keyName: string) {

    const stack = Stack.of(scope);
    const id = `${keyName}`;

    const stackKey = stack.nestedStackParent ? stack.nestedStackParent.node.tryFindChild(id) as Key : stack.node.tryFindChild(id) as Key;

    return stackKey || new Key(stack, id, {
      enableKeyRotation: true,
    });
  }
}
