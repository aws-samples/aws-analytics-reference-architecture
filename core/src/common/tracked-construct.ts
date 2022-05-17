import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

export interface TrackedConstructProps {
  trackingCode: string;
}

export class TrackedConstruct extends Construct {
  constructor(scope: Construct, id: string, props: TrackedConstructProps) {
    super(scope, id);

    if (!scope.node.tryGetContext('@aws-analytics-reference-architecture/disableConstructsDeploymentTracking')) {
      const stack = cdk.Stack.of(this);
      const description = `${stack.templateOptions.description} (${props.trackingCode})`;
      stack.templateOptions.description = description;
    }
  }
}
