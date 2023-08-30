// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests Opensearch cluster
 *
 * @group unit/opensearch-cluster
 */

import { Stack, aws_iam } from 'aws-cdk-lib';
import { OpensearchCluster } from '../../src';
import { Template } from 'aws-cdk-lib/assertions';

const opensearchStack = new Stack();

const accessRole = new aws_iam.Role(opensearchStack, 'AccessRole', {
  roleName: 'pipeline',
  assumedBy: new aws_iam.ServicePrincipal('ec2.amazonaws.com'),
});

OpensearchCluster.getOrCreate(opensearchStack, {
  accessRoles: [accessRole],
  adminUsername: 'admin',
  usernames: ['userA', 'userB'],
});

const template = Template.fromStack(opensearchStack);

test('Opensearch cluster created with correct name', () => {
  template.resourceCountIs('AWS::OpenSearchService::Domain', 1);

  template.hasResourceProperties('AWS::OpenSearchService::Domain', {
    DomainName: 'opensearch-platform',
  });
});
