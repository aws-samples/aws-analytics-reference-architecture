// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { readFileSync } from 'fs';
const ENCODING = 'utf8';

export function readSqlFile(path: string) {
  return readFileSync(path, ENCODING);
}