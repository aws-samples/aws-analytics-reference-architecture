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
from aws_cdk.aws_aps import(
    PrometheusWorkspace
)
import aws_cdk.aws_iam as iam

class PocStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        kubectl = KubectlV22Layer (self, 'kubectl_layer')

        prometheus_workspace = PrometheusWorkspace(self, 'PrometheusWorkspace')

        emr_eks = ara.EmrEksCluster.get_or_create(self,
                                                  eks_cluster_name='poc-cluster',
                                                  autoscaling=ara.Autoscaler.KARPENTER,
                                                  kubernetes_version= KubernetesVersion.V1_22,
                                                  kubectl_lambda_layer=kubectl
                                                )
        


        my_vc = emr_eks.add_emr_virtual_cluster(self,
                                                name='poc-vc',
                                                eks_namespace='batchjob',
                                                create_namespace=True)
        

        execution_role_policy = iam.ManagedPolicy(self, 'execution-role-policy',
                                                    statements=[
                                                        iam.PolicyStatement(
                                                            effect=iam.Effect.ALLOW,
                                                            actions=['s3:PutObject','s3:GetObject','s3:ListBucket'],
                                                            resources=[
                                                                'BUCKET'    
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
        
        CfnOutput(self, 'VirtualClusterId', value=my_vc.attr_id)
        CfnOutput(self, 'RoleArn', value=role.role_arn)
        CfnOutput(self, 'CriticalConfig', value=emr_eks.critical_default_config)
        CfnOutput(self, 'Prometheus', value=prometheus_workspace.attr_id)