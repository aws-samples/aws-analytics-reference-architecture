// workaround to get a Lambda function with inline code and packaged into the ARA library
// We need inline code to ensure it's deployable via a CloudFormation template
// TODO modify the PreBundledFunction to allow for inline Lambda in addtion to asset based Lambda
export const startBuild = `
const respond = async function(event, context, responseStatus, responseData, physicalResourceId, noEcho) {
  return new Promise((resolve, reject) => {
    var responseBody = JSON.stringify({
      Status: responseStatus,
      Reason: \"See the details in CloudWatch Log Stream: \" + context.logGroupName + \" \" + context.logStreamName,
      PhysicalResourceId: physicalResourceId || context.logStreamName,
      StackId: event.StackId,
      RequestId: event.RequestId,
      LogicalResourceId: event.LogicalResourceId,
      NoEcho: noEcho || false,
      Data: responseData
    });
    
    console.log(\"Response body:\", responseBody);
    
    var https = require(\"https\");
    var url = require(\"url\");
    
    var parsedUrl = url.parse(event.ResponseURL);
    var options = {
      hostname: parsedUrl.hostname,
      port: 443,
      path: parsedUrl.path,
      method: \"PUT\",
      headers: {
        \"content-type\": \"\",
        \"content-length\": responseBody.length
      }
    };
    
    var request = https.request(options, function(response) {
      console.log(\"Status code: \" + response.statusCode);
      console.log(\"Status message: \" + response.statusMessage);
      resolve();
    });
    
    request.on(\"error\", function(error) {
      console.log(\"respond(..) failed executing https.request(..): \" + error);
      resolve();
    });
    
    request.write(responseBody);
    request.end();
  });
};

const AWS = require('aws-sdk');

exports.handler = async function (event, context) {
  console.log(JSON.stringify(event, null, 4));
  try {
    const projectName = event.ResourceProperties.ProjectName;
    const codebuild = new AWS.CodeBuild();
    
    console.log(\`Starting new build of project \${projectName}\`);
    
    const { build } = await codebuild.startBuild({
      projectName,
      // Pass CFN related parameters through the build for extraction by the
      // completion handler.
      buildspecOverride: event.RequestType === 'Delete' ? 'buildspec-destroy.yml' : 'buildspec-deploy.yml',
      environmentVariablesOverride: [
        {
          name: 'CFN_RESPONSE_URL',
          value: event.ResponseURL
        },
        {
          name: 'CFN_STACK_ID',
          value: event.StackId
        },
        {
          name: 'CFN_REQUEST_ID',
          value: event.RequestId
        },
        {
          name: 'CFN_LOGICAL_RESOURCE_ID',
          value: event.LogicalResourceId
        },
        {
          name: 'BUILD_ROLE_ARN',
          value: event.ResourceProperties.BuildRoleArn
        }
      ]
    }).promise();
    console.log(\`Build id \${build.id} started - resource completion handled by EventBridge\`);
  } catch(error) {
    console.error(error);
    await respond(event, context, 'FAILED', { Error: error });
  }
};`;

export const reportBuild = `
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
const respond = async function(event, context, responseStatus, responseData, physicalResourceId, noEcho) {
  return new Promise((resolve, reject) => {
    var responseBody = JSON.stringify({
      Status: responseStatus,
      Reason: "See the details in CloudWatch Log Stream: " + context.logGroupName + " " + context.logStreamName,
      PhysicalResourceId: physicalResourceId || context.logStreamName,
      StackId: event.StackId,
      RequestId: event.RequestId,
      LogicalResourceId: event.LogicalResourceId,
      NoEcho: noEcho || false,
      Data: responseData
    });
    
    console.log("Response body:\
    ", responseBody);
    
    var https = require("https");
    var url = require("url");
    
    var parsedUrl = url.parse(event.ResponseURL);
    var options = {
      hostname: parsedUrl.hostname,
      port: 443,
      path: parsedUrl.path,
      method: "PUT",
      headers: {
        "content-type": "",
        "content-length": responseBody.length
      }
    };
    
    var request = https.request(options, function(response) {
      console.log("Status code: " + response.statusCode);
      console.log("Status message: " + response.statusMessage);
      resolve();
    });
    
    request.on("error", function(error) {
      console.log("respond(..) failed executing https.request(..): " + error);
      resolve();
    });
    
    request.write(responseBody);
    request.end();
  });
};
const AWS = require('aws-sdk');
exports.handler = async function (event, context) {
  console.log(JSON.stringify(event, null, 4));
  
  const projectName = event['detail']['project-name'];
  
  const codebuild = new AWS.CodeBuild();
  
  const buildId = event['detail']['build-id'];
  const { builds } = await codebuild.batchGetBuilds({
    ids: [ buildId ]
  }).promise();
  
  console.log(JSON.stringify(builds, null, 4));
  
  const build = builds[0];
  // Fetch the CFN resource and response parameters from the build environment.
  const environment = {};
  build.environment.environmentVariables.forEach(e => environment[e.name] = e.value);
  
  const response = {
    ResponseURL: environment.CFN_RESPONSE_URL,
    StackId: environment.CFN_STACK_ID,
    LogicalResourceId: environment.CFN_LOGICAL_RESOURCE_ID,
    RequestId: environment.CFN_REQUEST_ID
  };
  
  if (event['detail']['build-status'] === 'SUCCEEDED') {
    await respond(response, context, 'SUCCESS', { BuildStatus: 'SUCCESS'}, 'build');
  } else {
    await respond(response, context, 'FAILED', { Error: 'Build failed' });
  }
};
`;
