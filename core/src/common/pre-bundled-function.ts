import * as path from 'path';
import { Code, Function, FunctionProps } from '@aws-cdk/aws-lambda';
import * as cdk from '@aws-cdk/core';

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
 * (as it's installed as a 3rd party library.) This construct will change the path based on that.
 */
export class PreBundledFunction extends Function {
  constructor(scope: cdk.Construct, id: string, props: PreBundledFunctionProps) {

    if (props.code) {
      throw new Error('Pass "codePath" prop instead of "code" . See CONTRIBUTING.md on how to create prebundled Lambda function.');
    }

    let functionProps:any = { ...props };

    let assetPath;
    if (process.env.NODE_ENV !== 'test') {
      console.info(`Running in JSII, going to use modified path. process.env.JSII_AGENT =  ${process.env.JSII_AGENT}`);
      // __dirname is where this file is (lib/common). We need to go up one step (to lib).
      assetPath = path.join(__dirname, `../${props.codePath}`);
    } else {
      assetPath = `src/${props.codePath}`;
    }

    functionProps.code = Code.fromAsset(assetPath);
    delete functionProps.codePath;

    super(scope, id, { ...(functionProps as FunctionProps) });
  }
}