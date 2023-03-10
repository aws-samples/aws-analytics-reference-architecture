# Data platform with Amazon EMR on EKS and EMR Studio
This example demonstrate how to consume the AWS Analytics Reference Architecture constructs library to implement a data platform on Amazon EKS. The constructs simplify the setup of Amazon EKS, Amazon EMR on EKS and Amazon EMR Studio.

This example will provision the following resources and features:

* An EKS cluster configured with Karpenter autoscaler (can be replaced with the Cluster Autoscaler)
* Predefined Karpenter provisioners (or managed nodegroups) to autoscale the EKS resources from 0 to X
* EMR on EKS virtual clusters for batch job and notebooks with best practices configured (autoscaling, spot, graviton, local disks...)
* IAM execution roles down only to EMR on EKS pods for a given namespace
* An EMR Studio with IAM (can be replaced by SSO) user
* A Managed endpoint for integration with EMR Studio with permissions scoped to the user
* The demo can be extended using the EmrEksCluster construct API and the NotebookDataPlatform construct API

## Getting started

### Setup the environement

The `EmrEksCluster` construct can take an IAM Role as parameter to set it as the Amazon EKS administrator.
It's optional but if you want to do this, edit the `lib/emr-eks-app-stack.ts` file (line 16) and add the ARN of the IAM Role you want to use as administrator.

The code should look like this:

```
    const emrEks = ara.EmrEksCluster.getOrCreate(this,{
      eksAdminRoleArn: 'arn:aws:iam::1234567890:role/AdminAccess',
      eksClusterName:'dataplatform',
      autoscaling: ara.Autoscaler.KARPENTER,
    });
```

### Provision the data platform

1. Run `npm install` to install all the dependencies
2. Run `npm run build && cdk deploy --app './bin/emr-eks-app.js'`
3. The CDK application generates various outputs:
    * The EMR on EKS configuration for submitting jobs of different SLA (critical or shared)
    * The excution role ARN to use for submitting jobs
    * The results bucket used to write the output of the example job
    * The EMR on EKS virtual cluster ID whihc is the entrypoint for submitting the example job
    * Configuration commands for interacting with the EKS cluster (kubeconfig update, cluster access token, kubedashboard URL)
    * EMR Studio URL

### Run a batch job

1. Modify the critical-job.json or shared-job.json file. Change the following information with values from the `cdk deploy` outputs:

    `<VIRTUAL_CLUSTER_ID>`
    `<EXECUTION_ROLE_ARN>`
    `<RESULTS_BUCKET>`
    `<CRITICAL_CONFIG_JSON>`

2. Submit the job using the following CLI command 

   `aws emr-containers start-job-run --cli-input-json file://spark-jobs/critical-job-test.json`

### Cleanup

1. Wait for jobs to finish
2. Delete workspaces created in Amazon EMR Studio
3. Run `cdk destroy`