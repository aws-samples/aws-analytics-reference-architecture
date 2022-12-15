import { App, CfnOutput } from 'aws-cdk-lib';
import { CdkDeployer } from './common/cdk-deployer';
// eslint-disable-next-line import/no-extraneous-dependencies,import/no-unresolved


const mockApp = new App();

const cdkDeployerStack = new CdkDeployer(mockApp, 'CdkDeployerE2ETest', {
  githubRepository: 'aws-samples/aws-analytics-reference-architecture',
  cdkAppLocation: 'refarch/aws-native',
  cdkParameters: {
    QuickSightUsername: {
      default: 'gromav',
      type: 'String',
    },
    QuickSightIdentityRegion: {
      default: 'us-east-1',
      type: 'String',
    },
  },
});

new CfnOutput(cdkDeployerStack, 'CodeBuildStatus', {
  value: cdkDeployerStack.deployResult,
  exportName: 'CodeBuildStatus',
});

