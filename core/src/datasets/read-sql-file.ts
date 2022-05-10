// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { readFileSync } from 'fs';
const ENCODING = 'utf8';

/**
 * @deprecated Used by the DataGenerator construct but now replaced by the BatchReplayer
 */

export function readSqlFile(path: string) {
  return readFileSync(path, ENCODING);
}