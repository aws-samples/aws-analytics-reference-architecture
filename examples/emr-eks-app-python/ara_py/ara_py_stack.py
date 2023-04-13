from aws_cdk import (
    Stack,
    CfnOutput
)
from constructs import Construct
import aws_analytics_reference_architecture as ara
from aws_cdk.lambda_layer_kubectl_v22 import KubectlV22Layer
from aws_cdk.aws_eks import (
    KubernetesVersion,
    Cluster
    )
import aws_cdk.aws_iam as iam

class AraPyStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        result_bucket = ara.AraBucket.get_or_create(self, 
                                                    bucket_name='results-bucket')

        kubectl = KubectlV22Layer (self, 'kubectl_layer')

        emr_eks = ara.EmrEksCluster.get_or_create(self,
                                                  eks_cluster_name='my-cluster',
                                                  autoscaling=ara.Autoscaler.KARPENTER,
                                                  kubernetes_version= KubernetesVersion.V1_22,
                                                  kubectl_lambda_layer=kubectl
                                                )
        


        my_vc = emr_eks.add_emr_virtual_cluster(self,
                                                name='demo-vc',
                                                eks_namespace='batchjob',
                                                create_namespace=True)
        

        execution_role_policy = iam.ManagedPolicy(self, 'execution-role-policy',
                                                    statements=[
                                                        iam.PolicyStatement(
                                                            effect=iam.Effect.ALLOW,
                                                            actions=['s3:PutObject','s3:GetObject','s3:ListBucket'],
                                                            resources=[
                                                                result_bucket.bucket_arn,
                                                                result_bucket.arn_for_objects('*')    
                                                            ]
                                                        ),
                                                        iam.PolicyStatement(
                                                            effect=iam.Effect.ALLOW,
                                                            actions=['s3:GetObject','s3:ListBucket'],
                                                            resources=[
                                                                "arn:aws:s3:::nyc-tlc",
                                                                "arn:aws:s3:::nyc-tlc/*",
                                                                "arn:aws:s3:::aws-data-lake-workshop/spark-eks/spark-eks-assembly-3.3.0.jar",    
                                                            ]
                                                        ),
                                                        iam.PolicyStatement(
                                                            effect=iam.Effect.ALLOW,
                                                            actions=[
                                                                'logs:CreateLogGroup',
                                                                'logs:PutLogEvents',
                                                                'logs:CreateLogStream',
                                                                'logs:DescribeLogGroups',
                                                                'logs:DescribeLogStreams'
                                                            ],
                                                            resources=['arn:aws:logs:*:*:*']
                                                        ),
                                                    ]
                                                   )
        
        role = emr_eks.create_execution_role(self, 'execRole', execution_role_policy, 'batchjob', 'execRole')


        notebook_user_iam = iam.User(self, 'notebookUser', user_name='notebook-user')

        notebook_platform = ara.NotebookPlatform(self, 'notebook-platform', 
                                                 emr_eks= emr_eks,
                                                 studio_auth_mode= ara.StudioAuthMode.IAM,
                                                 studio_name= 'platform',
                                                 eks_namespace='notebook'
                                                 )
        
        notebook_platform.add_user(
            user_list=[
                ara.NotebookUserOptions (
                    iam_user= notebook_user_iam,
                    notebook_managed_endpoints=[
                        ara.NotebookManagedEndpointOptions (
                            execution_policy=execution_role_policy,
                            managed_endpoint_name='platform-notebook',
                            emr_on_eks_version= ara.EmrVersion.V6_9
                        )
                    ]
                )
            ])
        
        CfnOutput(self, 'VirtualClusterId', value=my_vc.attr_id)
        CfnOutput(self, 'RoleArn', value=role.role_arn)
        CfnOutput(self, 'CriticalConfig', value=emr_eks.critical_default_config)
        CfnOutput(self, 'CriticalConfig', value=result_bucket.bucket_name)



