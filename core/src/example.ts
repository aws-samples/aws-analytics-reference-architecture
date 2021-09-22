import { Construct, CfnOutput } from '@aws-cdk/core';

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

export class Example extends Construct {

  /**
   * Constructs a new instance of the Example class with CfnOutput.
   * CfnOutput can be customized.
   * @param {Construct} scope the Scope of the AWS CDK Construct
   * @param {string} id the ID of the AWS CDK Construct
   * @param {ExampleProps} props the ExampleProps [properties]{@link ExampleProps}
   * @since 1.0.0
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