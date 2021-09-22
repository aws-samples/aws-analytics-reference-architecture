// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { Database } from '@aws-cdk/aws-glue';
import { Construct, Stack } from '@aws-cdk/core';

/**
 * An Amazon S3 Bucket implementing the singleton pattern
 */
export class SingletonGlueDatabase extends Database {

  public static getOrCreate(scope: Construct, name: string) {
    const stack = Stack.of(scope);
    const id = `${name}`;
    return stack.node.tryFindChild(id) as Database || new Database(stack, id, {
      databaseName: name,
    });
  }
}