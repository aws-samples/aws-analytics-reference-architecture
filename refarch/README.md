
# AWS Analytics Reference Architecture

The AWS Analytics Reference Architecture is a set of analytics solutions put together as end-to-end examples.
It regroups AWS best practices for designing, implementing, and operating analytics platforms through different purpose-built patterns, handling common requirements, and solving customers' challenges.

This project is composed of:
 * Reusable core components exposed in an AWS CDK (Cloud Development Kit) library currently available in [Typescript](https://www.npmjs.com/package/aws-analytics-reference-architecture) and [Python](https://pypi.org/project/aws-analytics-reference-architecture/). This library contains [AWS CDK constructs](https://constructs.dev/packages/aws-analytics-reference-architecture/?lang=python) that can be used to quickly provision analytics solutions in demos, prototypes, proof of concepts and end-to-end reference architectures. 
 * Reference architectures consumming the reusable components to demonstrate end-to-end examples in a business context. Currently, the [AWS native reference architecture](https://aws-samples.github.io/aws-analytics-reference-architecture/) is available.

This documentation explains how to get started with the AWS native reference architecture.

## Getting started

- [AWS Analytics Reference Architecture](#aws-analytics-reference-architecture)
  - [Getting started](#getting-started)
    - [Deploying the AWS native reference architecture](#deploying-the-aws-native-reference-architecture)
      - [Prerequisites](#prerequisites)
      - [Deployment option 1: provision stacks directly (without CI/CD pipeline)](#deployment-option-1-provision-stacks-directly-without-cicd-pipeline)
      - [Deployment option 2: use CI/CD pipeline to maintain the stacks](#deployment-option-2-use-cicd-pipeline-to-maintain-the-stacks)
      - [Adding users to Kibana](#adding-users-to-kibana)
      - [Connecting to Amazon Redshift](#connecting-to-amazon-redshift)
    - [Clean up](#clean-up)
  - [Contributing](#contributing)
- [License Summary](#license-summary)

### Deploying the AWS native reference architecture

This section describes all steps that have to be performed to deploy the AWS native reference rchitecture into an AWS account.

#### Prerequisites

Before starting the deployment, ensure that the following steps are completed.

1. [Create an AWS account](https://aws.amazon.com/premiumsupport/knowledge-center/create-and-activate-aws-account/)
2. The AWS native reference architecture can only be deployed in **eu-west-1** for the moment
3. [Subscribe to Amazon QuickSight](https://docs.aws.amazon.com/quicksight/latest/user/signing-up.html) (if you plan to deploy the data visualization module)
4. Install the following components with the specified version on the machine from which the deployment will be executed:
    1. Python [3.8-3.9.2]
    2. Git
    3. AWS CDK: Please refer to the [Getting started](https://docs.aws.amazon.com/cdk/latest/guide/getting_started.html) guide.

#### Deployment option 1: provision stacks directly (without CI/CD pipeline)

Follow these steps or directly click on the launch button below

[![launch-aws-native-ref-arch](../../aws-analytics-reference-architecture/static/launch-stack.png)](https://console.aws.amazon.com/cloudformation/home#/stacks/new?stackName=AwsNativeRefArch&templateURL=https://aws-analytics-reference-architecture.s3.eu-west-1.amazonaws.com/binaries/RefArchDeployer.template.json)
 
1. Clone this repository onto the machine from which you want to execute the deployment.

   ```
   git clone https://github.com/aws-samples/aws-analytics-reference-architecture.git
   ```

2. Create a Python virtual environment in the project's directory, source it, and install all dependencies.

   ```
   cd aws-analytics-reference-architecture/refarch/aws-native
   python3 -m venv .env
   source .env/bin/activate
   pip install -r requirements.txt
   ```

3. Deploy the main AWS CDK stack into your AWS account, providing the required parameters.
If you install all modules, the Amazon QuickSight username (which can also be an IAM role) to which access should be granted to, as well as your QuickSight home region (the one selected during the QuickSight sign-up process) have to be specified. **Quicksight Entreprise edition is required to install the Dataviz module**.

   ```
   cdk deploy -c QuickSightUsername=<ROLE/USERNAME> -c QuickSightIdentityRegion=<REGION>
   ```

   Alternatively or additionally, you can disable modules.
The batch, data warehouse, data visualization, and streaming modules can be enabled/disabled using the respective context variable: `EnableBatch`/`EnableDWH`/`EnableDataviz`/`EnableStreaming`.
To disable, for example, the data visualization module, the following argument has to be used.
   ```
   cdk deploy  -c EnableDataviz=false
   ```
   
   **NOTE:
   Step 4 and 5 only have to be executed if the data visualization module has been installed.**
   
1. Configure Amazon QuickSight:
    * To link the clean data S3 bucket to the QuickSight account:
        * Visit the [QuickSight web console](https://quicksight.aws.amazon.com)
        * Click on your username in the upper right corner
        * Go to "Manage QuickSight"
        * Click "Security & permissions"
        * Select "Manage" in the "QuickSight access to AWS services" section
        * Click on the "Select S3 buckets" link
        * Select, i.e., check the box of, the S3 bucket named like the value of the CloudFormation output key `CleanS3Bucket` from the main CDK stack (named `clean-<ACCOUNT_ID>-<REGION>`) deployed into your account. The bucket name has the following format: `ara-clean-data-<account-id>`
        * Click "Finish" and then "Save" to confirm the selection 
    * To create the QuickSight VPC Connection:
        * Visit the [QuickSight web console](https://quicksight.aws.amazon.com)
        * Click on your username in the upper right corner
        * Go to "Manage QuickSight"
        * Click "Manage VPC connections"
        * Click "Add VPC connection"
        * Enter a "VPC connection name" of your choice, e.g., `ara`
        * Choose the "VPC ID" as the value of the CloudFormation output key `VPCID` from the main CDK stack (named `ara`) deployed into your account
        * Select one of the subnets that <strong>IS NOT</strong> shown in the outputs `SUBNETID0` and `SUBNETID1` from the main CDK stack
        * Copy and paste the value of the CloudFormation output key `QuickSightSecurityGroupId` from the main CDK stack into the "Security Group ID" field
        * Click "Create"
        * Note down the "VPC connection ARN" of the newly created VPC connection shown on the "Manage VPC connections" page

2. Deploy a second CDK stack, called `DataVizRedshiftStack`, passing the ARN of the VPC connection from the previous step.

   ```
   cd dataviz/dataviz_redshift_cdk
   cdk deploy --parameters VpcConnectionArn=<VPC_CONNECTION_ARN>
   ```

#### Deployment option 2: use CI/CD pipeline to maintain the stacks

You can use CI/CD pipeline to deploy this reference architecture. In this option, you will deploy only a pipeline stack. Then the pipeline will deploy the reference architecture. Each time you push a new version of code to your Git repository, the pipeline will redeploy with the updated code.

The pipeline and the reference architecture can live in different accounts or in the same account. If they live in different accounts, we refer to them as "CI/CD account" and "target account".

1. Bootstrap your CI/CD account with the modern stack style.

   ```
   export CDK_NEW_BOOTSTRAP=1
   cdk bootstrap --profile <CICD_ACCOUNT_PROFILE_NAME> aws://<CICD_ACCOUNT>/<CICD_ACCOUNT_REGION>
   ```

   Setting `CDK_NEW_BOOTSTRAP` makes CDK bootstrap the account with the new stack style. This is required for using CI/CD pipeline. 

1. Bootstrap your target accounts (Optional: only if your pipeline will deploy to another account)
   ```
   export CDK_NEW_BOOTSTRAP=1
   cdk bootstrap --profile <TARGET_ACCOUNT> \
   --trust <CICD_ACCOUNT> \
   --cloudformation-execution-policies arn:aws:iam::aws:policy/AdministratorAccess aws://<TARGET_ACCOUNT>/<TARGET_ACCOUNT_REGION>
   ```
   
   `--trust` option creates a trust relationship between your target account and your CI/CD account. Basically, it allows the CI/CD account to deploy resources into your target account. By specifying the `AdministratorAccess` policy you are giving the CI/CD account full admin privilege. In the case of any security concerns, this policy can be changed to a more restrictive one.


1. Fork this repository to your own. 

1. Clone the repository and create a Python virtual environments. 

   ```
   git clone https://github.com/<YOUR_GITHUB_ID>/aws-analytics-reference-architecture.git

   cd aws-analytics-reference-architecture/refarch/aws-native
   python3 -m venv .env
   source .env/bin/activate
   pip install -r requirements.txt
   ```

1. Create a 3rd-party connection to allow CodePipeline to pull changes from your repository.
      * Follow the steps [here](https://docs.aws.amazon.com/dtconsole/latest/userguide/connections-create.html) in the account that will host your CI/CD pipeline.
      * Copy the ARN of the for the next step
      

1. Set context variables  `refarch/aws-native/cdk.json`.
   * **Enable<MODULE_NAME>** with `true` or `false`, based on which modules you want to deploy
   * **EnableCICD** with `true`
   * **RepositoryName**:  with `<YOUR_GITHUB_ID>/aws-analytics-reference-architecture`
   * **RepositoryBranch**: with `main`. The CI/CD pipeline will be triggerred when you push to this branch
   * **ConnectionArn**: with the connection ARN you created in the previous step

1. Set the accounts and regions in `refarch/aws-native/cdk.context.json`
   * **<CICD_REGION>** and **<CICD_ACCOUNT>**: with the account that will host the pipeline
   * **<DEV_ACCOUNT>** and **<PROD_ACCOUNT>**: with the account that will be deployed.
   * Note that you can have only a single account to be both CI/CD and DEV. If you don't want PROD account, you can comment out the line `deploy_envs.append(prod_env)` in the file `refarch/aws-native/app.py`

1. Run `cdk deploy --profile <CICD_ACCOUNT_PROFILE_NAME> araPipelineStack` using the credentials for your CICD account.
      * This will deploy the stack containing the pipeline to your CICD account
      * After the pipeline has been successfully deploy, it will fetch code from the specified repo and deploy to the target account.

#### Adding users to Kibana

The main CDK stack also deploys the streaming module (if not explicitly disabled), which includes:

* Streaming data generation from TPC-DS to Kinesis and S3
* The Kinesis Data Analytics for Flink application
* The Amazon Elasticsearch Service domain

Once deployed, you need to create a master user for Elasticsearch and add it to the master group in Amazon Cognito.

Open the Cognito UI in the AWS console, select "Manage User Pools", click on the user pool named `ara_user_pool`, and choose the "Users and groups" menu. To start adding a new user, click the "Create user" button:

![step-1](../doc/images/1.png)

In the pop-up dialog, provide a username, password, and e-mail address, check "Send an invitation to this new user?" and "Mark email as verified?", uncheck "Mark phone number as verified?", and confirm with "Create user" to add the new master user:

![step-2](../doc/images/2.png)

The master user is created with a temporary password that has to be changed at first authentication. Note the unique user identifier (UUID) displayed in the "Username" column as shown on the next screen:

![step-3](../doc/images/3.png)

Now, add the master user to the `master-user-group` that has been created by the CDK stack. Switch to the "Groups" tab and select the group's name:

![step-4](../doc/images/4.png)

Click the "Add users" button at the group's detail page:

![step-5](../doc/images/5.png)

Click the `+` icon in front of the master user shown in the list, identified by the UUID:

![step-6](../doc/images/6.png)

A message will confirm that the user has been added successfully to the group:

![step-7](../doc/images/7.png)

Once the master user is added, you can connect to Kibana using the URL exposed in the streaming module's nested stack outputs (stack name start with `ara-StreamingModuleNestedStack` and output key starts with `EsDomainkibanaUrl`) and the temporary credential used to create the user.

The data is already being indexed in Elasticsearch, but you will need to [add a new index pattern](https://docs.aws.amazon.com/elasticsearch-service/latest/developerguide/es-gsg-search.html#es-gsg-search-kibana) (use pattern `ara-sales-*` to get started) in Kibana to start seeing it.

#### Connecting to Amazon Redshift

For security reasons, the Redshift cluster is in a private subnet. 
Therefore, you won't be able to connect directly to the cluster with a SQL client, 
e.g., psql or a JDBC/ODBC client like DataGrip or Tableau. To connect to the cluster, 
you need to create an SSH tunnel via the bastion host. 
Host and connection details for the bastion host are available in the CDK and CloudFormation output:
 * The secret name containing the keypair is in `ara-Redshift-bastion-keypair-secret`
 * The bastion host DNS to connect is in `ara-Redshift-bastion-dns`
 * The Redshift hostname and port are in `ara-Redshift-hostname` and `ara-Redshift-port`

The following are the required syntax and examples of how to create the tunnel and connect via
[psql](https://docs.aws.amazon.com/redshift/latest/mgmt/connecting-from-psql.html). The commands need to be run in a command line environment like Terminal on Mac or cmd on Windows.

**Download the private key pair from AWS Secret Manager**

```
aws secretsmanager get-secret-value \
  --secret-id <ara-Redshift-bastion-keypair-secret> \
  --query SecretString \
  --output text >> bastion-host-key-pair.pem
```

**Change key file permissions**

```
chmod 400 bastion-host-key-pair.pem
```

**Create SSH tunnel:**

```
ssh -N -L <local_port>:<ara-Redshift-hostname>:<ara-Redshift-port> ec2-user@<ara-Redshift-bastion-dns> -i bastion-host-key-pair.pem
```

e.g.

```
ssh -N -L 5400:ara-redshift-cluster-1.ckkq2ei6ah54.eu-west-1.redshift.amazonaws.com:5439 ec2-user@34.251.89.55 -i bastion-host-key-pair.pem
```

**Connect to Redshift with psql:** (Multiple Redshift users and password are available in AWS Secret Manager)

```
psql -h <localhost> -p <local_port> -U <redshift_user> -d <redshift_database>
```

e.g.

```
psql -h localhost -p 5400 -U dwsuser -d dev
```

### Clean up

1. (If the data visualisation module has been deployed) Delete the QuickSight VPC Connection, otherwise destroying the stack will fail.
2. (If the data visualisation module has been deployed) Destroy the stack called `DataVizRedshiftStack`.
   ```
   cd dataviz/dataviz_redshift_cdk/
   cdk destroy
   # confirm "Are you sure you want to delete: ara-dataviz-redshift (y/n)?" with y
   ```
3. Destroy the main AWS CDK stack.
   ```
   cd ../..
   cdk destroy
   # confirm "Are you sure you want to delete: ara (y/n)?" with y
   ```

## Contributing

Please refer to the [contributing guidelines](../CONTRIBUTING.md) and [contributing FAQ](../CONTRIB_FAQ.md) for details.

# License Summary

The documentation is made available under the Creative Commons Attribution-ShareAlike 4.0 International License. See the LICENSE file.

The sample code within this documentation is made available under the MIT-0 license. See the LICENSE-SAMPLECODE file.
