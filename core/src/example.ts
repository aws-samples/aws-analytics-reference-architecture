// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { Construct, CfnOutput } from '@aws-cdk/core';

/**
 * @ignore
 * // DO NOT include ignore tag, if you do TypeDoc will not include documentation of your construct
 * The properties for the Example Construct class.
 */

export interface ExampleProps {
  /**
   * Name used to qualify the CfnOutput in the Stack
   * @default -  Set to 'defaultMessage' if not provided
   */
  readonly name?: string;
  /**
   * Value used in the CfnOutput in the Stack
   * @default -  Set to 'defaultValue!' if not provided
   */
  readonly value?: string;
}

/**
 * @ignore
 * // DO NOT include ignore tag, if you do TypeDoc will not include documentation of your construct
 * Example Construct to help onboarding contributors.
 * This example includes best practices for code comment/documentation generation,
 * and for default parameters pattern in CDK using Props with Optional properties
 */

export class Example extends Construct {

  /**
   * @ignore
   * // DO NOT include ignore tag, if you do TypeDoc will not include documentation of your construct
   * Constructs a new instance of the Example class with CfnOutput.
   * CfnOutput can be customized.
   * @param {Construct} scope the Scope of the CDK Construct
   * @param {string} id the ID of the CDK Construct
   * @param {ExampleProps} props the ExampleProps properties
   * @access public
   */

  constructor(scope: Construct, id: string, props: ExampleProps) {
    super(scope, id);

    // add a fake CFN Output to the Stack
    // use an export name because the output name is defined by AWS CDK
    new CfnOutput(this, 'message', {
      exportName: props.name ? props.name: 'defaultMessage',
      value: props.value ? props.value: 'defaultValue!',
    });
  }
}
