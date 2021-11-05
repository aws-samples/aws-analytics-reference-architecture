// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { join } from 'path';
import { readSqlFile } from './read-sql-file';

const SQL_FOLDER_PATH = join(__dirname, 'resources/retail-store');

export const retailStoreCreate = readSqlFile(join(SQL_FOLDER_PATH, 'create.sql'));;

export const retailStoreGenerate = readSqlFile(join(SQL_FOLDER_PATH, 'generate.sql'));;