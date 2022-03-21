import { ServicePrincipal } from '@aws-cdk/aws-iam';
import {App, Aspects, Stack} from '@aws-cdk/core';
// eslint-disable-next-line import/no-extraneous-dependencies
import { AwsSolutionsChecks } from 'cdk-nag';
import { Ec2SsmRole } from '../ec2-ssm-role';

const mockApp = new App();

const ec2SsmRoleStack = new Stack(mockApp, 'ec2-ssm-role');

// Instantiate Ec2SsmRole Construct
new Ec2SsmRole(ec2SsmRoleStack, 'Ec2SsmRole', { assumedBy: new ServicePrincipal('ec2.amazonaws.com') });

Aspects.of(ec2SsmRoleStack).add(new AwsSolutionsChecks({ verbose: true }));
