// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { join } from 'path';
import { readSqlFile } from './read-sql-file';

const SQL_FOLDER_PATH = join(__dirname, 'resources/retail-warehouse');

export const retailWarehouseCreate = readSqlFile(join(SQL_FOLDER_PATH, 'create.sql'));

export const retailWarehouseGenerate = readSqlFile(join(SQL_FOLDER_PATH, 'generate.sql'));