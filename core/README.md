# Construct Definition

This construct deploys an end-to-end platform to explore and experiment with data in a 
data lake using spark engine deployed in EMR on EKS.

## What it deploys

* An EKS cluster
* An EMR virtual Cluster
* A KMS encryption Key used to encrypt an S3 bucket and Cloudwatch GroupLog  
* An S3 Bucket used by EMR Studio to store the Jupyter notebooks
* An EMR Studio service Role as defined [here][1], and customize to access the S3 bucket and KMS key created above
* An EMR Studio User Role as defined [here][2] - The policy template which is leveraged is the Basic one
* An EMR Studio tenant
* Multiple ManagedEnpdoints, each for a user or a group of users
* Create an execution role to be passed to the Managed endpoint from a policy arn provided by the user  
* Multiple Session Policies that are used to map an EMR Studio user or group to a set of resources they are allowed to access. These resources are:
    * EMR Virtual Cluster - created above
    * ManagedEndpoint
* An EventBridge Rule which detects the creation of a new EMR Studio Workspace
* A Lambda triggered by the EventBridge rule created above and which tag the EMR Studio Workspace with the principalId of the user who created


# How to use the construct

In your CDK app, from the _dataplatform-notebook_ construct import the `DataPlatformNotebook` Class, and the `StudioUserDefinition` interface.

The `DataPlatformNotebook` is used to create a new construct and its constructor expects the following:

```
studioName: <the name of the EMR Studio>
authMode: SSO, IAM_AUTH or IAM_FED
emrVCNamespace: 'dept1nc'
eksAdminRoleArn: <ARN of EKS admin role>
acmCertificateArn: <ARN of ACM certificate>
```

_**For the time being only SSO is supported in the construct**_

The `StudioUserDefinition` interface define a user to be added to the studio and expects the following:

```
mappingIdentityName: <identity name as it appears in SSO>
mappingIdentityType: <USER>
executionPolicyNames: <List of the policies for the managedendpoints>
```

Once an object is initialized from `DataPlatformNotebook` class, you can start adding users using the `addUsers` method. The method expects a List of `StudioUserDefinition`.


## The code snippet below shows how you can use the construct

```
const dataPlatform = new DataPlatformNotebook(stack, 'dataplatform', {
studioName: 'Studio-from-dataplatform-construct',
authMode: StudioAuthMode.SSO,
eksAdminRoleArn: 'arn:aws:iam::0123456789012:role/***',
acmCertificateArn: 'arn:aws:acm:<region>:0123456789012:certificate/******',
});

let userList: StudioUserDefinition[];

userList = [{
mappingIdentityName: 'toto',
mappingIdentityType: 'USER',
executionPolicyNames: ['policyManagedEndpoint1', 'policyManagedEndpoint2'],
},
{
mappingIdentityName: 'jane',
mappingIdentityType: 'USER',
executionPolicyNames: ['policyManagedEndpoint1'],
}];

dataPlatform.addUsers(userList);
```

[1]: [https://docs.aws.amazon.com/emr/latest/ManagementGuide/emr-studio-service-role.html]
[2]: [https://docs.aws.amazon.com/emr/latest/ManagementGuide/emr-studio-user-permissions.html#emr-studio-basic-permissions-policy]
