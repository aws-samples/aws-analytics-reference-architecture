// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { DefaultStackSynthesizer, Fn, Stack } from "aws-cdk-lib";
import { Role } from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";

/**
 * Utilities class used across the different resources
 */
export class Utils {

  /**
   * Sanitize a string by removing upper case and replacing special characters except underscore
   * @param {string} toSanitize the string to sanitize
   */
  public static stringSanitizer(toSanitize: string): string {
    return toSanitize.toLowerCase().replace(/[^\w\s]/gi, '');
  }

  /**
   * Create a random string to be used as a seed for IAM User password
   * @param {string} name the string to which to append a random string
   */
  public static randomize(name: string) {
    return `${name}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  }

  /**
   * Import the default IAM role used by CDK 
   * @param {Construct} scope the scope to import the role into
   * @param {string} id the ID of the role in the stack 
   */
  public static getCdkExecRole(scope: Construct, id: string) {
    const cdkExecutionRoleArn = Fn.sub(
      DefaultStackSynthesizer.DEFAULT_CLOUDFORMATION_ROLE_ARN,
      {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Qualifier: DefaultStackSynthesizer.DEFAULT_QUALIFIER,
      },
    );
    // Makes the CDK execution role LF admin so it can create databases
    return Role.fromRoleArn(Stack.of(scope), `${id}Role`, cdkExecutionRoleArn); 
  }

  /**
   * Import the default IAM role used for CDK deploy 
   * @param {Construct} scope the scope to import the role into
   * @param {string} id the ID of the role in the stack 
   */
  public static getCdkDeployRole(scope: Construct, id: string) {
    const cdkDeployRoleArn = Fn.sub(
      DefaultStackSynthesizer.DEFAULT_DEPLOY_ROLE_ARN,
      {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Qualifier: DefaultStackSynthesizer.DEFAULT_QUALIFIER,
      },
    );
    // Makes the CDK execution role LF admin so it can create databases
    return Role.fromRoleArn(Stack.of(scope), `${id}Role`, cdkDeployRoleArn); 
  }

  /**
   * Import the default IAM role used for CDK file publishing 
   * @param {Construct} scope the scope to import the role into
   * @param {string} id the ID of the role in the stack 
   */
     public static getCdkFilePublishRole(scope: Construct, id: string) {
      const cdkDeployRoleArn = Fn.sub(
        DefaultStackSynthesizer.DEFAULT_FILE_ASSET_PUBLISHING_ROLE_ARN,
        {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          Qualifier: DefaultStackSynthesizer.DEFAULT_QUALIFIER,
        },
      );
      // Makes the CDK execution role LF admin so it can create databases
      return Role.fromRoleArn(Stack.of(scope), `${id}Role`, cdkDeployRoleArn); 
    }
}
