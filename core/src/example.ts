import * as cdk from '@aws-cdk/core';

/**
 * @summary The properties for the Example Construct class.
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
 * @Summary Example Construct to help onboarding contributors.
 */

export class Example extends cdk.Construct {

  /**
   * Constructs a new instance of the Example class with default CfnOutput.
   * CfnOutput can be customized.
   * @param {cdk.App} scope the Scope of the CDK Stack
   * @param {string} id the ID of the CDK Stack
   * @param {ExampleProps} props the ExampleProps [properties]{@link ExampleProps}
   * @since 1.0.0
   * @access public
   */

  constructor(scope: cdk.Construct, id: string, props: ExampleProps) {
    super(scope, id);

    // add a fake CFN Output to the Stack
    // use an export name because the output name is defined by CDK
    new cdk.CfnOutput(this, 'message', {
      exportName: props.name ? props.name: 'defaultMessage',
      value: props.value ? props.value: 'defaultValue!',
    });
  }
}