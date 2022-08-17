import { App, Stack } from 'aws-cdk-lib';
// eslint-disable-next-line import/no-extraneous-dependencies,import/no-unresolved
import { CentralGovernance, DataDomain } from './data-mesh';


const mockApp = new App();
const domainStack = new Stack(mockApp, 'domain', {
  env: {
    account: '111111111111',
    region: 'us-east-1',
  },
});

const govStack = new Stack(mockApp, 'gov', {
  env: {
    account: '222222222222',
    region: 'us-east-1',
  },
});


new DataDomain(domainStack, 'DataDomain', { centralAccountId: '222222222222'});

const gov = new CentralGovernance(govStack, 'CentralGovernance');

gov.registerDataDomain('Register', '111111111111');


