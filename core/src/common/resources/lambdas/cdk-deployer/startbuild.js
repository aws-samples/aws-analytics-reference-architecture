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
    
    console.log("Response body:", responseBody);
    
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
  try {
    const projectName = event.ResourceProperties.ProjectName;
    const codebuild = new AWS.CodeBuild();
    
    console.log(`Starting new build of project ${projectName}`);
    
    const { build } = await codebuild.startBuild({
      projectName,
      // Pass CFN related parameters through the build for extraction by the
      // completion handler.
      buildspecOverride: event.RequestType === 'Delete' ? 
      `
version: 0.2
env:
  variables:
    CFN_RESPONSE_URL: CFN_RESPONSE_URL_NOT_SET
    CFN_STACK_ID: CFN_STACK_ID_NOT_SET
    CFN_REQUEST_ID: CFN_REQUEST_ID_NOT_SET
    CFN_LOGICAL_RESOURCE_ID: CFN_LOGICAL_RESOURCE_ID_NOT_SET
phases:
  pre_build:
    on-failure: ABORT
    commands:
      - cd $CODEBUILD_SRC_DIR/$CDK_APP_LOCATION
      - npm install -g aws-cdk && sudo apt-get install python3 && python -m
        ensurepip --upgrade && python -m pip install --upgrade pip && python -m
        pip install -r requirements.txt
      - "export AWS_ACCOUNT_ID=$(echo $CODEBUILD_BUILD_ARN | cut -d: -f5)"
      - 'echo "AWS_ACCOUNT_ID: $AWS_ACCOUNT_ID"'
      - cdk bootstrap aws://$AWS_ACCOUNT_ID/$AWS_REGION
  build:
    on-failure: ABORT
    commands:
      - "export AWS_ACCOUNT_ID=$(echo $CODEBUILD_BUILD_ARN | cut -d: -f5)"
      - 'echo "AWS_ACCOUNT_ID: $AWS_ACCOUNT_ID"'
      - cdk destroy --force --all --require-approval never
      `
      :
      `
version: 0.2
env:
  variables:
    CFN_RESPONSE_URL: CFN_RESPONSE_URL_NOT_SET
    CFN_STACK_ID: CFN_STACK_ID_NOT_SET
    CFN_REQUEST_ID: CFN_REQUEST_ID_NOT_SET
    CFN_LOGICAL_RESOURCE_ID: CFN_LOGICAL_RESOURCE_ID_NOT_SET
    PARAMETERS: PARAMETERS_NOT_SET
    STACKNAME: STACKNAME_NOT_SET
phases:
  pre_build:
    on-failure: ABORT
    commands:
      - cd $CODEBUILD_SRC_DIR/$CDK_APP_LOCATION
      - npm install -g aws-cdk && sudo apt-get install python3 && python -m
        ensurepip --upgrade && python -m pip install --upgrade pip && python -m
        pip install -r requirements.txt
      - "export AWS_ACCOUNT_ID=$(echo $CODEBUILD_BUILD_ARN | cut -d: -f5)"
      - 'echo "AWS_ACCOUNT_ID: $AWS_ACCOUNT_ID"'
      - cdk bootstrap aws://$AWS_ACCOUNT_ID/$AWS_REGION
  build:
    on-failure: ABORT
    commands:
      - "export AWS_ACCOUNT_ID=$(echo $CODEBUILD_BUILD_ARN | cut -d: -f5)"
      - 'echo "AWS_ACCOUNT_ID: $AWS_ACCOUNT_ID"'
      - cdk deploy $STACKNAME $PARAMETERS --require-approval=never
      `,
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
    console.log(`Build id ${build.id} started - resource completion handled by EventBridge`);
  } catch(error) {
    console.error(error);
    await respond(event, context, 'FAILED', { Error: error });
  }
};