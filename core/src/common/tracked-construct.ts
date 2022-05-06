import * as cdk from '@aws-cdk/core';

export interface TrackedConstructProps {
  readonly trackingCode: string;
}

export class TrackedConstruct extends cdk.Construct {
  constructor(scope: cdk.Construct, id: string, props: TrackedConstructProps) {
    super(scope, id);

    if (!scope.node.tryGetContext('@aws-analytics-reference-architecture/disableConstructsDeploymentTracking')) {
      const stack = cdk.Stack.of(this);
      const description = `${stack.templateOptions.description} (${props.trackingCode})`;
      stack.templateOptions.description = description;
    }
  }
}
