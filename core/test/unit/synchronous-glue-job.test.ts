// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests SynchronousGlueJob 
 *
 * @group unit/other/synchronous-glue-job
 */

import { Code, GlueVersion, JobExecutable, PythonVersion } from '@aws-cdk/aws-glue-alpha';
import { Stack } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { SynchronousGlueJob } from '../../src/synchronous-glue-job';
import * as path from 'path';


describe('SynchronousGlueJob test', () => {

  const glueJobStartWaitStack = new Stack();

  new SynchronousGlueJob(glueJobStartWaitStack, 'MyJob', {
    executable: JobExecutable.pythonShell({
      glueVersion: GlueVersion.V1_0,
      pythonVersion: PythonVersion.THREE,
      script: Code.fromAsset(path.join(__dirname, '../resources/glue-script/synchronous-glue-job-script.py')),
    }),
  });
  
  const template = Template.fromStack(glueJobStartWaitStack);
  //console.log(JSON.stringify(template.toJSON(),null, 2));
  
  test('SynchronousGlueJob should create the right number of resources', () => {

    template.resourceCountIs('AWS::IAM::Role', 9);
    template.resourceCountIs('AWS::Lambda::Function', 6);
    template.resourceCountIs('AWS::CloudFormation::CustomResource', 1);
    template.resourceCountIs('AWS::Glue::Job', 1);
    
  });

  test('SynchronousGlueJob should create the proper Glue Job with tags', () => {

    template.hasResourceProperties('AWS::Glue::Job', 
      Match.objectLike({
        Tags: Match.objectLike(
          { 'for-use-with': 'synchronous-glue-job' },
        ),
      })
    );
  });

  test('SynchronousGlueJob should create the proper Policy for managing Glue Jobs', () => {

    template.hasResourceProperties('AWS::IAM::ManagedPolicy', 
      Match.objectLike({
        PolicyDocument: {
          Statement: Match.arrayWith([
            Match.objectLike({
              Action: Match.arrayWith([
                'glue:StartJobRun',
                'glue:GetJobRun',
                'glue:BatchStopJobRun',
              ]),
              Condition: {
                StringEquals: { 'aws:ResourceTag/for-use-with': 'synchronous-glue-job' }
              }
            }),
          ])
        }
      })
    );
  });
});
