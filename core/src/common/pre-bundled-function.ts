import * as path from 'path';
import { Code, Function, FunctionProps } from '@aws-cdk/aws-lambda';
import * as cdk from '@aws-cdk/core';

/**
 * Extends existing FunctionProps as optional using `Partial`
 *(as we don't require `Code` prop)
 */
export interface PreBundledFunctionProps extends Partial<FunctionProps>{
  codePath: string;
}

/**
 * Wrapper of lambda.Function construct for prebunded file.
 * It changes of the code path by based on the environment that `cdk synth` is running on.
 *
 * This class is used together with a Projen custom task "copy-resources", and "pip-install".
 * The tasks will ensure that all Python and libraries files are available in "lib" folder
 *
 * However, the files will be under `node_modules` when installed as a 3rd party library.
 * Thus, so this wrapper changes that path.
 */
export class PreBundledFunction extends Function {
  constructor(scope: cdk.Construct, id: string, props: PreBundledFunctionProps) {

    if (props.code) {
      throw new Error('Pass "codePath" prop instead of "code" . See CONTRIBUTING.md on how to create prebundled Lambda function.');
    }

    let functionProps:any = { ...props };

    let assetPath;
    if (process.env.NODE_ENV !== 'test') {
      // __dirname will be in lib/common folder. We need to go up one step.
      console.info(`Running in JSII, going to use modified path. process.env.JSII_AGENT =  ${process.env.JSII_AGENT}`);
      assetPath = path.join(__dirname, `../${props.codePath}`);
    } else {
      console.info('Running in unit test mode. Refer to the directory in src directly.');
      assetPath = `src/${props.codePath}`;
    }

    functionProps.code = Code.fromAsset(assetPath);
    delete functionProps.codePath;

    super(scope, id, { ...(functionProps as FunctionProps) });
  }
}