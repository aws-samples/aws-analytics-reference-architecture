# Construct Definition

This construct deploys an end-to-end platform to explore and experiment with data in a 
data lake using spark engine deployed in EMR on EKS, and a Jupyter notebook infrastructure based on EMR Studio 

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

In your CDK app, from the _dataplatform_ construct import the `DataPlatform` Class, and the `DataPlatformProps` interface.

The `DataPlatform` is used to create a new construct and its constructor expects the following:

```
eksAdminRoleArn: <ARN of EKS admin role>
```
The initialization of the construct will create an EKS cluster. 
The getOrCreate method expects the same EKS admin ARN role everytime it is invoked

To create a notebook data platform supported by EMR Studio, you should use the object instantiated from `DataPlatform` Class
and call the method `addNotebookPlatform`, the method expects one argument:
* `dataPlatformNotebookProps` which defines the properties of the stack, you can import the `DataPlatformNotebookProp`
from the `DataPlatformNotebook` construct to define the properties of the Studio.

To add user to the notebook dataplaform created above you should use the method `addUsersNotebookPlatform` from the object instantiated  from `DataPlatform` Class
The method expects two arguments:
* The name of the `notebookPlatformName` as provided in the `addNotebookPlatform`
* A user list as defined in the prop `StudioUserDefinition` interface define a user to be added to the studio and expects the following:

```
mappingIdentityName: <identity name as it appears in SSO>
mappingIdentityType: <USER>
executionPolicyNames: <List of the policies for the managedendpoints>
```


## The code snippet below shows how you can use the construct

The code below instantiate a new `DataPlatform` called _dept1_ then use it to create two notebook dataplatfrom based on EMR Studio 
with a stack called dept1 and dept2, then add a single user to both of them.

```
const dept1 = DataPlatform.getOrCreate(stack, {
  eksAdminRoleArn: 'arn:aws:iam::123456789012:role/EkRole',
});

dept1.addNotebookPlatform({
  studioName: 'unit1',
  emrVCNamespace: 'unit1ns',
  studioAuthMode: StudioAuthMode.SSO,
  acmCertificateArn: 'ACM certificate ARN',
});

dept1.addNotebookPlatform({
  studioName: 'unit2',
  emrVCNamespace: 'unit2ns',
  studioAuthMode: StudioAuthMode.SSO,
  acmCertificateArn: 'ACM certificate ARN',
});

let userList1: StudioUserDefinition[] = [{
  identityName: 'user',
  identityType: 'USER',
  executionPolicyNames: ['policyManagedEndpoint1'],
}];

let userList2: StudioUserDefinition[] = [{
  identityName: 'user',
  identityType: 'USER',
  executionPolicyNames: ['policyManagedEndpoint3'],
}];

dept1.addUsersNotebookPlatform('unit1', userList1);
dept1.addUsersNotebookPlatform('unit2', userList2);
```

[1]: [https://docs.aws.amazon.com/emr/latest/ManagementGuide/emr-studio-service-role.html]
[2]: [https://docs.aws.amazon.com/emr/latest/ManagementGuide/emr-studio-user-permissions.html#emr-studio-basic-permissions-policy]
