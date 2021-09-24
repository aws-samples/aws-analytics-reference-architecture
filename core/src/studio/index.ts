// eslint-disable-next-line @typescript-eslint/no-require-imports
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-require-imports
const AWS: unknown = require('aws-sdk');

exports.handler = async (event: unknown) => {

  const emr = new AWS.EMR({ apiVersion: '2009-03-31' });

  // @ts-ignore
  const params = {
    // @ts-ignore
    ResourceId: event.detail.responseElements.editorId, /* required */
    Tags: [
      {
        Key: 'creatorId',
        // @ts-ignore
        Value: event.detail.userIdentity.principalId,
      },
    ],
  };

  console.log(params);

  const response = await emr.addTags(params).promise();

  console.log(response);


};
