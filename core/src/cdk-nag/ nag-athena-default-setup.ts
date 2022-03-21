
import {App, Aspects, Stack} from '@aws-cdk/core';
// eslint-disable-next-line import/no-extraneous-dependencies
import { AwsSolutionsChecks } from 'cdk-nag';
import { AthenaDefaultSetup } from '../athena-default-setup';

const mockApp = new App();

const athenaDefaultSetupStack = new Stack(mockApp, 'athena-default-setup');
// Instantiate an AthenaDefaultSetup
new AthenaDefaultSetup(athenaDefaultSetupStack, 'athenaDefault');

Aspects.of(athenaDefaultSetupStack).add(new AwsSolutionsChecks());
