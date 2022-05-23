// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import * as path from 'path';
import {Code, LayerVersion, LayerVersionProps, Runtime} from 'aws-cdk-lib/aws-lambda';
import { Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';

/**
 * The properties for the PreBundledLayer construct. 
 * It extends existing LayerProps as optional using `Partial` (as we don't require `Code` prop)
 */
export interface PreBundledLayerProps extends Partial<LayerVersionProps>{
  codePath: string;
}

/**
 * A Layer with prebundled dependencies that can be reused accross multiple [PreBundledFunction]{@link PreBundledFunction} resources.
 * This layer reduces the total size of the Analytics Reference Architecture library by factorizing common dependencies in one shared layer. 
 * 
 * Do not include packages in your Lambda function `requirements.txt` if they are already part of the PreBundledLayer.
 * 
 * Here is the list of bundled dependencies:
 * * astroid==2.4.2
 * * autopep8==1.6.0
 * * backports.entry-points-selectable==1.1.0
 * * boto3==1.20.12
 * * botocore==1.23.12
 * * click==8.0.3
 * * distlib==0.3.2
 * * filelock==3.0.12
 * * Flask==2.0.2
 * * isort==5.6.4
 * * itsdangerous==2.0.1
 * * Jinja2==3.0.2
 * * jmespath==0.10.0
 * * lazy-object-proxy==1.4.3
 * * MarkupSafe==2.0.1
 * * mccabe==0.6.1
 * * platformdirs==2.2.0
 * * pycodestyle==2.8.0
 * * pylint==2.6.0
 * * python-dateutil==2.8.2
 * * s3transfer==0.5.0
 * * six==1.15.0
 * * toml==0.10.2
 * * urllib3==1.26.7
 * * virtualenv==20.7.0
 * * Werkzeug==2.0.2
 * * wrapt==1.12.1
 */
export class PreBundledLayer extends LayerVersion {

  /**
   * Get an existing PreBundledLayer if it already exists in the CDK scope or create a new one
   * @param {Construct} scope the CDK scope used to search or create the cluster
   * @param {string} codePath the code path used to create the layer
   */
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

  /**
   * Constructs a new instance of the PreBundledLayer construct
   * @param {Construct} scope the Scope of the CDK Construct
   * @param {string} id the ID of the CDK Construct
   * @param {PreBundledFunctionProps} props the PreBundledFunction [properties]{@link PreBundledFunctionProps}
   */
  constructor(scope: Construct, id: string, props: PreBundledLayerProps) {

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
