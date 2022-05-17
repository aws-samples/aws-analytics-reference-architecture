// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import * as path from 'path';
import { Code, Function, FunctionProps } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
/**
 * Extends existing FunctionProps as optional using `Partial`
 * (as we don't require `Code` prop)
 */
export interface PreBundledFunctionProps extends Partial<FunctionProps>{
  codePath: string;
}

/**
 * A Lambda function with prebundled dependencies
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
export class PreBundledFunction extends Function {
  constructor(scope: Construct, id: string, props: PreBundledFunctionProps) {

    if (props.code) {
      throw new Error('Pass "codePath" prop instead of "code" . See CONTRIB_FAQ.md on how to create prebundled Lambda function.');
    }

    let functionProps:any = { ...props };

    // __dirname is where this file is. In JSII, it is <jsii_tmp_path>/lib/common.
    // When running unit tests, it is ./src/common). In boht case, we need to go up one level.
    let assetPath = path.join(__dirname, `../${props.codePath}`);

    functionProps.code = Code.fromAsset(assetPath);
    delete functionProps.codePath;

    super(scope, id, { ...(functionProps as FunctionProps) });
  }
}