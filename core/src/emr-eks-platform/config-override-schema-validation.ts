// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { validator } from '@exodus/schemasafe';

/**
 * Helper function used to validate the schema of the custom configuration provided when
 * creating an EMR on EKS Managed Endpoint
 * @param overrideConfigSchema The validation schema
 * @param overrideConfigData The JSON configuration to validate
 */
export function validateSchema (
  overrideConfigSchema: string,
  overrideConfigData: string | undefined): boolean | never {

  if (overrideConfigData !== undefined) {
    const schemaObject = JSON.parse(overrideConfigSchema);

    const data = JSON.parse(JSON.stringify(overrideConfigData));

    const validate = validator(schemaObject);

    if (validate(data)) {
      return true;
    } else {
      throw new Error(`The configuration override is not valid JSON : ${overrideConfigData}`);
    }
  } else {
    return false;
  }
}


