// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { CfnLaunchTemplate } from '@aws-cdk/aws-ec2';
import { Construct, Stack } from '@aws-cdk/core';
//import BlockDeviceMappingProperty = CfnLaunchTemplate.BlockDeviceMappingProperty;

/**
 * A LaunchTemplate implementing the singleton pattern
 */
export class SingletonCfnLaunchTemplate extends CfnLaunchTemplate {

  public static getOrCreate(scope: Construct, name: string, data: string) {
    const stack = Stack.of(scope);
    const id = `${name}`;
    return stack.node.tryFindChild(id) as CfnLaunchTemplate || new CfnLaunchTemplate(stack, id, {
      launchTemplateName: name,
      launchTemplateData: {
        userData: data,
      },
    });
  }

  //  blockDeviceMappings: this.ebsProperty,

  //Commented out while we fix the device name and size
  /**
   * private static readonly ebsProperty: BlockDeviceMappingProperty [] = [{
   *  ebs: {
   *   volumeType: 'gp3',
   * },
   * }];
   */

}
