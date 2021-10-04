import * as path from 'path';
import { Code, Function, FunctionProps } from '@aws-cdk/aws-lambda';
import * as cdk from '@aws-cdk/core';

/**
 * Extends existing FunctionProps as optional (as we don't need `Code` prop)
 * and require `codePath` prop.
 */
export interface PreBundledFunctionProps extends Partial<FunctionProps>{
  codePath: string;
}

// const PACKAGE_NAME = 'aws-analytics-reference-architecture';

/**
 * Wrapper of lambda.Function construct.
 * It changes of the code path by adding the prefix `node_modules/${PACKAGE_NAME}`
 * and suffix `.zip`.
 *
 * This class is used together with a Projen custom task "bundle:<lambda-function>".
 * The tasks will generate a zip file that can be referred to for `Code.fromAsset()`.
 * However, the zip fille will be under `node_modules` when installed as a 3rd party library.
 * Thus, we need to add prefix and suffix .zip.
 */
export class PreBundledFunction extends Function {
  constructor(scope: cdk.Construct, id: string, props: PreBundledFunctionProps) {


    if (props.code) {
      throw new Error('Pass "codePath" prop instead of "code" . See CONTRIBUTING.md on how to create prebundled Lambda function.');
      // TODO: update CONTRIBUTING.md
    }

    let functionProps:any = { ...props };

    // Running on Python
    let assetPath;
    if (process.env.NODE_ENV === 'test') {
      console.info('Running in unit test mode. Refer to the prebundled Lambda file directly.');
      assetPath = `${props.codePath}.zip`;
    } else {
      console.info(`Use prebundled function. process.env.JSII_AGENT =  ${process.env.JSII_AGENT}`);
      console.info('__dirname', __dirname);
      assetPath = path.join(__dirname, `../${props.codePath}.zip`);
    }

    functionProps.code = Code.fromAsset(assetPath);
    delete functionProps.codePath;

    super(scope, id, { ...(functionProps as FunctionProps) });
  }
}