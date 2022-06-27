// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import * as path from 'path';
import { JobExecutable, PythonSparkJobExecutableProps, Code } from '@aws-cdk/aws-glue-alpha';


/**
 * Props for creating a Python Spark Job in Glue with pre-bundled code.
 * It extends existing PythonSparkJobExecutableProps as optional using `Partial`
 */
export interface PreBundledPysparkJobExecutableProps extends Partial<PythonSparkJobExecutableProps> {
  codePath: string;
}

/**
 * A Glue JobExecutable with prebundled code that can be used to create Glue Jobs.
 *
 * It changes of the code path by based on the environment that `cdk synth` is running on.
 *
 * This class is used together with a Projen custom task "copy-resources".
 * The task will ensure that the Glue script is available in "lib" folder, with the same relative path.
 *
 * When this construct is being run in JSII, this file will be in `node_modules` folder
 * (as it's installed as a 3rd party library.) So we need to change reference based on __dirname.
 *
 *  * Usage example:
 * ```typescript
 * import { PreBundledPysparkJobExecutable } from 'aws-analytics-reference-architecture';
 * import { Job } from '@aws-cdk/aws-glue-alpha';
 * 
 * new glue.Job(this, 'PythonShellJob', {
 *   executable: PreBundledPysparkJobExecutable({
 *     glueVersion: glue.GlueVersion.V3_0,
 *     pythonVersion: glue.PythonVersion.THREE,
 *     codePath: 'construct-dir/resources/glue/script.py',
 *   }),
 *   description: 'an example PySpark job with bundled script',
 * });
 * ```
 */
export class PreBundledPysparkJobExecutable {
 
  public static preBundledPythonEtl(props: PreBundledPysparkJobExecutableProps) {
    
    if (props.script) {
      throw new Error('Use "codePath" prop instead of "script" to ensure the code is bundled into the Glue job');
    }

    let jobProps: any = { ...props };
    // __dirname is where this file is. In JSII, it is <jsii_tmp_path>/lib/common.
    // When running unit tests, it is ./src/common). In both case, we need to go up one level.
    let assetPath = path.join(__dirname, `../${props.codePath}`);

    jobProps.script = Code.fromAsset(assetPath);
    delete jobProps.codePath;

    return JobExecutable.pythonEtl(jobProps);
  }
}