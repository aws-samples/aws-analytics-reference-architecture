// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import * as path from 'path';
import {Code, LayerVersion, LayerVersionProps, Runtime} from '@aws-cdk/aws-lambda';
import * as cdk from '@aws-cdk/core';
import { Construct, Stack } from '@aws-cdk/core';

/**
 * Extends existing LayerProps as optional using `Partial`
 * (as we don't require `Code` prop)
 */
export interface PreBundledLayerProps extends Partial<LayerVersionProps>{
  codePath: string;
}

/**
 * A Layer with prebundled dependencies
 *
 * It changes of the code path by based on the environment that `cdk synth` is running on.
 *
 * This class is used together with a Projen custom task "copy-resources", and "pip-install".
 * The tasks will ensure that all Python and libraries files are available in "lib" folder,
 * with the same relative path
 *
 * When this construct is being run in JSII, this file will be in `node_modules` folder
 * (as it's installed as a 3rd party library.) So we need to change reference based on __dirname.
 */
export class PreBundledLayer extends LayerVersion {

  public static getOrCreate(scope: Construct, codePath: string) {
    const stack = Stack.of(scope);
    const id = 'boto3Layer';

    // eslint-disable-next-line max-len
    const boto3Layer = stack.nestedStackParent ? stack.nestedStackParent.node.tryFindChild(id) as LayerVersion : stack.node.tryFindChild(id) as LayerVersion;

    return boto3Layer || new PreBundledLayer(stack, id, {
      codePath: codePath,
      compatibleRuntimes: [Runtime.PYTHON_3_6, Runtime.PYTHON_3_8, Runtime.PYTHON_3_7, Runtime.PYTHON_3_9],
      layerVersionName: 'ara-boto3-layer',
    });
  }


  constructor(scope: cdk.Construct, id: string, props: PreBundledLayerProps) {

    if (props.code) {
      throw new Error('Pass "codePath" prop instead of "code" . See CONTRIB_FAQ.md on how to create prebundled Lambda function.');
    }

    let layerProps:any = { ...props };

    // __dirname is where this file is. In JSII, it is <jsii_tmp_path>/lib/common.
    // When running unit tests, it is ./src/common). In both case, we need to go up one level.
    let assetPath = path.join(__dirname, `../${props.codePath}`);

    layerProps.code = Code.fromAsset(assetPath);

    //delete props that were added to force user input
    delete layerProps.codePath;

    super(scope, id, { ...(layerProps as LayerVersionProps) });

  }
}
