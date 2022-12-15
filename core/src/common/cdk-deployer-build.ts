// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

// workaround to get a Lambda function with inline code and packaged into the ARA library
// We need inline code to ensure it's deployable via a CloudFormation template
// TODO modify the PreBundledFunction to allow for inline Lambda in addtion to asset based Lambda
export const startBuild = "const respond = async function(event, context, responseStatus, responseData, physicalResourceId, noEcho) {\n  return new Promise((resolve, reject) => {\n    var responseBody = JSON.stringify({\n      Status: responseStatus,\n      Reason: \"See the details in CloudWatch Log Stream: \" + context.logGroupName + \" \" + context.logStreamName,\n      PhysicalResourceId: physicalResourceId || context.logStreamName,\n      StackId: event.StackId,\n      RequestId: event.RequestId,\n      LogicalResourceId: event.LogicalResourceId,\n      NoEcho: noEcho || false,\n      Data: responseData\n    });\n    \n    console.log(\"Response body:\", responseBody);\n    \n    var https = require(\"https\");\n    var url = require(\"url\");\n    \n    var parsedUrl = url.parse(event.ResponseURL);\n    var options = {\n      hostname: parsedUrl.hostname,\n      port: 443,\n      path: parsedUrl.path,\n      method: \"PUT\",\n      headers: {\n        \"content-type\": \"\",\n        \"content-length\": responseBody.length\n      }\n    };\n    \n    var request = https.request(options, function(response) {\n      console.log(\"Status code: \" + response.statusCode);\n      console.log(\"Status message: \" + response.statusMessage);\n      resolve();\n    });\n    \n    request.on(\"error\", function(error) {\n      console.log(\"respond(..) failed executing https.request(..): \" + error);\n      resolve();\n    });\n    \n    request.write(responseBody);\n    request.end();\n  });\n};\n\nconst AWS = require('aws-sdk');\n\nexports.handler = async function (event, context) {\n  console.log(JSON.stringify(event, null, 4));\n  try {\n    const projectName = event.ResourceProperties.ProjectName;\n    const codebuild = new AWS.CodeBuild();\n    \n    console.log(`Starting new build of project ${projectName}`);\n    \n    const { build } = await codebuild.startBuild({\n      projectName,\n      // Pass CFN related parameters through the build for extraction by the\n      // completion handler.\n      buildspecOverride: event.RequestType === 'Delete' ? \n      `\nversion: 0.2\nenv:\n  variables:\n    CFN_RESPONSE_URL: CFN_RESPONSE_URL_NOT_SET\n    CFN_STACK_ID: CFN_STACK_ID_NOT_SET\n    CFN_REQUEST_ID: CFN_REQUEST_ID_NOT_SET\n    CFN_LOGICAL_RESOURCE_ID: CFN_LOGICAL_RESOURCE_ID_NOT_SET\nphases:\n  pre_build:\n    on-failure: ABORT\n    commands:\n      - cd $CODEBUILD_SRC_DIR/$CDK_APP_LOCATION\n      - npm install -g aws-cdk && sudo apt-get install python3 && python -m\n        ensurepip --upgrade && python -m pip install --upgrade pip && python -m\n        pip install -r requirements.txt\n      - \"export AWS_ACCOUNT_ID=$(echo $CODEBUILD_BUILD_ARN | cut -d: -f5)\"\n      - 'echo \"AWS_ACCOUNT_ID: $AWS_ACCOUNT_ID\"'\n      - cdk bootstrap aws://$AWS_ACCOUNT_ID/$AWS_REGION\n  build:\n    on-failure: ABORT\n    commands:\n      - \"export AWS_ACCOUNT_ID=$(echo $CODEBUILD_BUILD_ARN | cut -d: -f5)\"\n      - 'echo \"AWS_ACCOUNT_ID: $AWS_ACCOUNT_ID\"'\n      - cdk destroy --force --all --require-approval never\n      `\n      :\n      `\nversion: 0.2\nenv:\n  variables:\n    CFN_RESPONSE_URL: CFN_RESPONSE_URL_NOT_SET\n    CFN_STACK_ID: CFN_STACK_ID_NOT_SET\n    CFN_REQUEST_ID: CFN_REQUEST_ID_NOT_SET\n    CFN_LOGICAL_RESOURCE_ID: CFN_LOGICAL_RESOURCE_ID_NOT_SET\n    PARAMETERS: PARAMETERS_NOT_SET\n    STACKNAME: STACKNAME_NOT_SET\nphases:\n  pre_build:\n    on-failure: ABORT\n    commands:\n      - cd $CODEBUILD_SRC_DIR/$CDK_APP_LOCATION\n      - npm install -g aws-cdk && sudo apt-get install python3 && python -m\n        ensurepip --upgrade && python -m pip install --upgrade pip && python -m\n        pip install -r requirements.txt\n      - \"export AWS_ACCOUNT_ID=$(echo $CODEBUILD_BUILD_ARN | cut -d: -f5)\"\n      - 'echo \"AWS_ACCOUNT_ID: $AWS_ACCOUNT_ID\"'\n      - cdk bootstrap aws://$AWS_ACCOUNT_ID/$AWS_REGION\n  build:\n    on-failure: ABORT\n    commands:\n      - \"export AWS_ACCOUNT_ID=$(echo $CODEBUILD_BUILD_ARN | cut -d: -f5)\"\n      - 'echo \"AWS_ACCOUNT_ID: $AWS_ACCOUNT_ID\"'\n      - cdk deploy $STACKNAME $PARAMETERS --require-approval=never\n      `,\n      environmentVariablesOverride: [\n        {\n          name: 'CFN_RESPONSE_URL',\n          value: event.ResponseURL\n        },\n        {\n          name: 'CFN_STACK_ID',\n          value: event.StackId\n        },\n        {\n          name: 'CFN_REQUEST_ID',\n          value: event.RequestId\n        },\n        {\n          name: 'CFN_LOGICAL_RESOURCE_ID',\n          value: event.LogicalResourceId\n        },\n        {\n          name: 'BUILD_ROLE_ARN',\n          value: event.ResourceProperties.BuildRoleArn\n        }\n      ]\n    }).promise();\n    console.log(`Build id ${build.id} started - resource completion handled by EventBridge`);\n  } catch(error) {\n    console.error(error);\n    await respond(event, context, 'FAILED', { Error: error });\n  }\n};"

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
`
