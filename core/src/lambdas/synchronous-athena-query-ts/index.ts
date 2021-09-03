// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import * as AWS from 'aws-sdk';

const athena = new AWS.Athena({ region: process.env.AWS_REGION });

export async function onEvent(event: any) {
  console.log(event);
  switch (event.RequestType) {
    case 'Create':
      return onCreate(event);
    case 'Update':
      return onCreate(event);
    case 'Delete':
      return onDelete(event);
  }
  return false;
}

export async function onCreate(event: any) {
  var resultPath = event.ResourceProperties.ResultPath;
  // Check if the result path has trailing slash and add it
  if (!resultPath.endsWith('/')) {
    console.log('adding trailing slash to the resultPath');
    resultPath = resultPath.concat('/');
  } else {
    console.log('trailing slash already present');
  }
  // Build the command
  const command = {
    QueryString: event.ResourceProperties.Statement,
    ResultConfiguration: {
      OutputLocation: resultPath,
    },
  };
  console.log(command);

  try {
    const responseStart = await athena.startQueryExecution(command).promise();
    return {
      PhysicalResourceId: responseStart.QueryExecutionId,
      Data: responseStart,
    };

  } catch (error) {
    console.log(error);
    return false;
  }
}

export async function onDelete(event: any) {
  console.log('delete not implemented');
  return {
    PhysicalResourceId: event.PhysicalResourceId,
    Data: event.ResourceProperties,
  };
}

export async function isComplete(event: any) {
  console.log(event);
  if (event.RequestType == 'Delete') return { isComplete: true };
  const command = {
    QueryExecutionId: event.PhysicalResourceId,
  };
  console.log(command);
  try {
    const responseGet = await athena.getQueryExecution(command).promise();
    if (!responseGet.QueryExecution) return { isComplete: false };
    console.log(responseGet.QueryExecution);
    switch (responseGet.QueryExecution.Status) {
      case 'QUEUED' || 'RUNNING':
        return { isComplete: false };
      case 'SUCCEEDED':
        return { isComplete: true, Data: responseGet.QueryExecution };
      default:
        throw new Error(`Athena query error: ${responseGet.QueryExecution.Status}`);
    }
  } catch (error) {
    console.log(error);
    return false;
  }
}