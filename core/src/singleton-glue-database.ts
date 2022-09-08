// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { Database } from '@aws-cdk/aws-glue-alpha';
import { Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';

/**
 * AWS Glue Database implementing the singleton pattern
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