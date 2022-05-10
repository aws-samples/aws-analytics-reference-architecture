// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { join } from 'path';
import { readSqlFile } from './read-sql-file';

const SQL_FOLDER_PATH = join(__dirname, 'resources/retail-item');

/**
 * @deprecated Used by the DataGenerator construct but now replaced by the BatchReplayer
 */

export const retailItemCreate = readSqlFile(join(SQL_FOLDER_PATH, 'create.sql'));;

/**
 * @deprecated Used by the DataGenerator construct but now replaced by the BatchReplayer
 */

export const retailItemGenerate = readSqlFile(join(SQL_FOLDER_PATH, 'generate.sql'));;