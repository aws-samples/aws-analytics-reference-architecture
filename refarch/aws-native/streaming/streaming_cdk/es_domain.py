# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

import subprocess

from aws_cdk import (
    core,
    aws_lambda as _lambda,
    aws_logs as logs,
    aws_elasticsearch as es
)
from aws_cdk.aws_cognito import CfnUserPool, CfnUserPoolDomain, CfnIdentityPool, CfnIdentityPoolRoleAttachment, \
    CfnUserPoolGroup
from aws_cdk.aws_iam import FederatedPrincipal, Role, ServicePrincipal, ManagedPolicy, ArnPrincipal, PolicyDocument, \
    PolicyStatement
from aws_cdk.aws_kms import Key
from aws_cdk.core import CfnOutput, CustomResource, Fn, Stack, RemovalPolicy, Duration
from aws_cdk.custom_resources import Provider


class EsDomain(core.Construct):
    @property
    def user_pool(self):
        return self.__user_pool

    @property
    def id_pool(self):
        return self.__id_pool

    @property
    def es_domain(self):
        return self.__es_domain

    def __init__(self,
                 scope: core.Construct,
                 id: str,
                 application_prefix: str,
                 suffix: str,
                 kda_role: Role,
                 **kwargs):
        super().__init__(scope, id, **kwargs)

        stack = Stack.of(self)
        region = stack.region

        # Create Cognito User Pool
        self.__user_pool = CfnUserPool(scope=self,
                                       id='UserPool',
                                       admin_create_user_config={'allowAdminCreateUserOnly': True},
                                       policies={'passwordPolicy': {'minimumLength': 8}},
                                       username_attributes=['email'],
                                       auto_verified_attributes=['email'],
                                       user_pool_name=application_prefix + '_user_pool')

        # Create a Cognito User Pool Domain using the newly created Cognito User Pool
        CfnUserPoolDomain(scope=self,
                          id='CognitoDomain',
                          domain=application_prefix + '-' + suffix,
                          user_pool_id=self.user_pool.ref)

        # Create Cognito Identity Pool
        self.__id_pool = CfnIdentityPool(scope=self,
                                         id='IdentityPool',
                                         allow_unauthenticated_identities=False,
                                         cognito_identity_providers=[],
                                         identity_pool_name=application_prefix + '_identity_pool')

        trust_relationship = FederatedPrincipal(federated='cognito-identity.amazonaws.com',
                                                conditions={
                                                    'StringEquals': {
                                                        'cognito-identity.amazonaws.com:aud': self.id_pool.ref},
                                                    'ForAnyValue:StringLike': {
                                                        'cognito-identity.amazonaws.com:amr': 'authenticated'}},
                                                assume_role_action='sts:AssumeRoleWithWebIdentity')
        # IAM role for master user
        master_auth_role = Role(scope=self,
                                id='MasterAuthRole',
                                assumed_by=trust_relationship)
        # Role for authenticated user
        limited_auth_role = Role(scope=self,
                                 id='LimitedAuthRole',
                                 assumed_by=trust_relationship)
        # Attach Role to Identity Pool
        CfnIdentityPoolRoleAttachment(scope=self,
                                      id='userPoolRoleAttachment',
                                      identity_pool_id=self.id_pool.ref,
                                      roles={'authenticated': limited_auth_role.role_arn})
        # Create master-user-group
        CfnUserPoolGroup(scope=self,
                         id='AdminsGroup',
                         user_pool_id=self.user_pool.ref,
                         group_name='master-user-group',
                         role_arn=master_auth_role.role_arn
                         )
        # Create limited-user-group
        CfnUserPoolGroup(scope=self,
                         id='UsersGroup',
                         user_pool_id=self.user_pool.ref,
                         group_name='limited-user-group',
                         role_arn=limited_auth_role.role_arn)
        # Role for the Elasticsearch service to access Cognito
        es_role = Role(scope=self,
                       id='EsRole',
                       assumed_by=ServicePrincipal(service='es.amazonaws.com'),
                       managed_policies=[ManagedPolicy.from_aws_managed_policy_name('AmazonESCognitoAccess')])

        # Use the following command line to generate the python dependencies layer content
        # pip3 install -t lambda-layer/python/lib/python3.8/site-packages -r lambda/requirements.txt
        # Build the lambda layer assets
        subprocess.call(
            ['pip', 'install', '-t', 'streaming/streaming_cdk/lambda-layer/python/lib/python3.8/site-packages', '-r',
             'streaming/streaming_cdk/bootstrap-lambda/requirements.txt', '--upgrade'])

        requirements_layer = _lambda.LayerVersion(scope=self,
                                                  id='PythonRequirementsTemplate',
                                                  code=_lambda.Code.from_asset('streaming/streaming_cdk/lambda-layer'),
                                                  compatible_runtimes=[_lambda.Runtime.PYTHON_3_8])

        # This lambda function will bootstrap the Elasticsearch cluster
        bootstrap_function_name = 'AESBootstrap'
        register_template_lambda = _lambda.Function(scope=self,
                                                    id='RegisterTemplate',
                                                    runtime=_lambda.Runtime.PYTHON_3_8,
                                                    code=_lambda.Code.from_asset(
                                                        'streaming/streaming_cdk/bootstrap-lambda'),
                                                    handler='es-bootstrap.lambda_handler',
                                                    environment={'REGION': region,
                                                                 'KDA_ROLE_ARN': kda_role.role_arn,
                                                                 'MASTER_ROLE_ARN': master_auth_role.role_arn},
                                                    layers=[requirements_layer],
                                                    timeout=Duration.minutes(15),
                                                    function_name=bootstrap_function_name)

        lambda_role = register_template_lambda.role
        lambda_role.add_to_policy(PolicyStatement(actions=['logs:CreateLogGroup'],
                                                  resources=[stack.format_arn(service='logs', resource='*')]))
        lambda_role.add_to_policy(PolicyStatement(actions=['logs:CreateLogStream', 'logs:PutLogEvents'],
                                                  resources=[stack.format_arn(service='logs', resource='log_group',
                                                                              resource_name='/aws/lambda/' + bootstrap_function_name + ':*')]))

        # Let the lambda assume the master role so that actions can be executed on the cluster
        # https://aws.amazon.com/premiumsupport/knowledge-center/lambda-function-assume-iam-role/
        lambda_role.add_to_policy(PolicyStatement(actions=['sts:AssumeRole'],
                                                  resources=[master_auth_role.role_arn]))

        master_auth_role.assume_role_policy.add_statements(
            PolicyStatement(actions=['sts:AssumeRole'],
                            principals=[lambda_role])
        )

        # List all the roles that are allowed to access the Elasticsearch cluster.
        roles = [ArnPrincipal(limited_auth_role.role_arn),
                 ArnPrincipal(master_auth_role.role_arn),
                 ArnPrincipal(kda_role.role_arn)]  # The users
        if register_template_lambda and register_template_lambda.role:
            roles.append(ArnPrincipal(lambda_role.role_arn))  # The lambda used to bootstrap
        # Create kms key
        kms_key = Key(scope=self,
                      id='kms-es',
                      alias='custom/es',
                      description='KMS key for Elasticsearch domain',
                      enable_key_rotation=True)

        # AES Log Groups
        es_app_log_group = logs.LogGroup(scope=self,
                                         id='EsAppLogGroup',
                                         retention=logs.RetentionDays.ONE_WEEK,
                                         removal_policy=RemovalPolicy.RETAIN)

        # Create the Elasticsearch domain
        es_domain_arn = stack.format_arn(service='es', resource='domain', resource_name=application_prefix + '/*')

        es_access_policy = PolicyDocument(
            statements=[PolicyStatement(principals=roles,
                                        actions=['es:ESHttpGet', 'es:ESHttpPut', 'es:ESHttpPost', 'es:ESHttpDelete'],
                                        resources=[es_domain_arn])])
        self.__es_domain = es.CfnDomain(scope=self,
                                        id='searchDomain',
                                        elasticsearch_cluster_config={'instanceType': 'r5.large.elasticsearch',
                                                                      'instanceCount': 2,
                                                                      'dedicatedMasterEnabled': True,
                                                                      'dedicatedMasterCount': 3,
                                                                      'dedicatedMasterType': 'r5.large.elasticsearch',
                                                                      'zoneAwarenessEnabled': True,
                                                                      'zoneAwarenessConfig': {
                                                                          'AvailabilityZoneCount': '2'},
                                                                      },
                                        encryption_at_rest_options={
                                            'enabled': True,
                                            'kmsKeyId': kms_key.key_id
                                        },
                                        node_to_node_encryption_options={'enabled': True},
                                        ebs_options={'volumeSize': 10, 'ebsEnabled': True},
                                        elasticsearch_version='7.9',
                                        domain_name=application_prefix,
                                        access_policies=es_access_policy,
                                        cognito_options={
                                            'enabled': True,
                                            'identityPoolId': self.id_pool.ref,
                                            'roleArn': es_role.role_arn,
                                            'userPoolId': self.user_pool.ref
                                        },
                                        advanced_security_options={
                                            'enabled': True,
                                            'internalUserDatabaseEnabled': False,
                                            'masterUserOptions': {'masterUserArn': master_auth_role.role_arn}
                                        },
                                        domain_endpoint_options={
                                            'enforceHttps': True,
                                            'tlsSecurityPolicy': 'Policy-Min-TLS-1-2-2019-07'
                                        },
                                        # log_publishing_options={
                                        #     # 'ES_APPLICATION_LOGS': {
                                        #     #     'enabled': True,
                                        #     #     'cloud_watch_logs_log_group_arn': es_app_log_group.log_group_arn
                                        #     # },
                                        #     # 'AUDIT_LOGS': {
                                        #     #     'enabled': True,
                                        #     #     'cloud_watch_logs_log_group_arn': ''
                                        #     # },
                                        #     # 'SEARCH_SLOW_LOGS': {
                                        #     #     'enabled': True,
                                        #     #     'cloud_watch_logs_log_group_arn': ''
                                        #     # },
                                        #     # 'INDEX_SLOW_LOGS': {
                                        #     #     'enabled': True,
                                        #     #     'cloud_watch_logs_log_group_arn': ''
                                        #     # }
                                        # }
                                        )

        # Not yet on the roadmap...
        # See https://github.com/aws-cloudformation/aws-cloudformation-coverage-roadmap/issues/283
        # self.es_domain.add_property_override('ElasticsearchClusterConfig.WarmEnabled', True)
        # self.es_domain.add_property_override('ElasticsearchClusterConfig.WarmCount', 2)
        # self.es_domain.add_property_override('ElasticsearchClusterConfig.WarmType', 'ultrawarm1.large.elasticsearch')

        # Deny all roles from the authentication provider - users must be added to groups
        # This lambda function will bootstrap the Elasticsearch cluster
        cognito_function_name = 'CognitoFix'
        cognito_template_lambda = _lambda.Function(scope=self,
                                                   id='CognitoFixLambda',
                                                   runtime=_lambda.Runtime.PYTHON_3_8,
                                                   code=_lambda.Code.from_asset(
                                                       'streaming/streaming_cdk/cognito-lambda'),
                                                   handler='handler.handler',
                                                   environment={'REGION': scope.region,
                                                                'USER_POOL_ID': self.__user_pool.ref,
                                                                'IDENTITY_POOL_ID': self.__id_pool.ref,
                                                                'LIMITED_ROLE_ARN': limited_auth_role.role_arn},
                                                   timeout=Duration.minutes(15),
                                                   function_name=cognito_function_name)

        lambda_role = cognito_template_lambda.role
        lambda_role.add_to_policy(PolicyStatement(actions=['logs:CreateLogGroup'],
                                                  resources=[stack.format_arn(service='logs', resource='*')]))
        lambda_role.add_to_policy(PolicyStatement(actions=['logs:CreateLogStream', 'logs:PutLogEvents'],
                                                  resources=[stack.format_arn(service='logs', resource='log_group',
                                                                              resource_name='/aws/lambda/' + cognito_function_name + ':*')]))
        lambda_role.add_to_policy(PolicyStatement(actions=['cognito-idp:ListUserPoolClients'],
                                                  resources=[self.user_pool.attr_arn]))
        lambda_role.add_to_policy(PolicyStatement(actions=['iam:PassRole'],
                                                  resources=[limited_auth_role.role_arn]))

        cognito_id_res = Fn.join(':',
                                 ['arn:aws:cognito-identity', scope.region, scope.account,
                                  Fn.join('/', ['identitypool', self.__id_pool.ref])])

        lambda_role.add_to_policy(PolicyStatement(actions=['cognito-identity:SetIdentityPoolRoles'],
                                                  resources=[cognito_id_res]))

        # Get the Domain Endpoint and register it with the lambda as environment variable.
        register_template_lambda.add_environment('DOMAIN', self.__es_domain.attr_domain_endpoint)

        CfnOutput(scope=self,
                  id='createUserUrl',
                  description="Create a new user in the user pool here.",
                  value="https://" + scope.region + ".console.aws.amazon.com/cognito/users?region=" + scope.region +
                        "#/pool/" + self.user_pool.ref + "/users")
        CfnOutput(scope=self,
                  id='kibanaUrl',
                  description="Access Kibana via this URL.",
                  value="https://" + self.__es_domain.attr_domain_endpoint + "/_plugin/kibana/")

        bootstrap_lambda_provider = Provider(scope=self,
                                             id='BootstrapLambdaProvider',
                                             on_event_handler=register_template_lambda)
        CustomResource(scope=self,
                       id='ExecuteRegisterTemplate',
                       service_token=bootstrap_lambda_provider.service_token,
                       properties={'Timeout': 900})

        cognito_lambda_provider = Provider(scope=self,
                                           id='CognitoFixLambdaProvider',
                                           on_event_handler=cognito_template_lambda)
        cognito_fix_resource = CustomResource(scope=self, id='ExecuteCognitoFix',
                                              service_token=cognito_lambda_provider.service_token)
        cognito_fix_resource.node.add_dependency(self.__es_domain)
