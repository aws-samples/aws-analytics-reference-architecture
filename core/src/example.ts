import * as cdk from '@aws-cdk/core';

/**
 * Properties for Example Construct
 *
 */

export interface ExampleProps {
  readonly name?: string;
  readonly value?: string;
}

/**
 * Example Construct to help onboarding contributors
 *
 */

export class Example extends cdk.Construct {

  /**
   * Return only a CfnOutput
   * @param scope the Scope of the CDK Stack
   * @param id the ID of the CDK Stack
   */

  constructor(scope: cdk.Construct, id: string, props: ExampleProps) {
    super(scope, id);

    // add a fake CFN Output to the Stack
    // we use an export name
    new cdk.CfnOutput(this, 'message', {
      exportName: props.name ? props.name: 'defaultMessage',
      value: props.value ? props.value: 'defaultValue!',
    });
  }
}