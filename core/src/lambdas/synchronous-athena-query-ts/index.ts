import {
  AthenaClient,
  StartQueryExecutionCommand,
  GetQueryExecutionCommand,
  StartQueryExecutionCommandOutput,
  GetQueryExecutionCommandOutput,
} from '@aws-sdk/client-athena';

const athena = new AthenaClient({ region: process.env.AWS_REGION });

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
  }
  const command = new StartQueryExecutionCommand({
    QueryString: event.ResourceProperties.Statement,
    ResultConfiguration: {
      OutputLocation: resultPath,
    },
  });
  try {
    const responseStart = await athena.send(command);
    return {
      PhysicalResourceId: responseStart.QueryExecutionId,
      Data: responseStart,
    };

  } catch (error) {
    const { requestId, cfId, extendedRequestId, httpStatusCode } = (error as StartQueryExecutionCommandOutput).$metadata;
    console.log({ requestId, cfId, extendedRequestId, httpStatusCode });
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

  const command = new GetQueryExecutionCommand({
    QueryExecutionId: event.PhysicalResourceId,
  });
  try {
    const responseGet = await athena.send(command);
    console.log(responseGet);
    if (!responseGet.QueryExecution) return { isComplete: false };
    switch (responseGet.QueryExecution.Status) {
      case 'QUEUED' || 'RUNNING':
        return { isComplete: false };
      case 'SUCCEEDED':
        return { isComplete: true, Data: responseGet.QueryExecution };
      default:
        throw new Error(`Athena query error: ${responseGet.QueryExecution.Status}`);
    }
  } catch (error) {
    const { requestId, cfId, extendedRequestId, httpStatusCode } = (error as GetQueryExecutionCommandOutput).$metadata;
    console.log({ requestId, cfId, extendedRequestId, httpStatusCode });
    return false;
  }
}