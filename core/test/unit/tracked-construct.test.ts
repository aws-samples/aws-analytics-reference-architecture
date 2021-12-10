// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Tests tracking construct
 *
 * @group unit/othrer/tracking-construct
 */


import { App, Stack } from '@aws-cdk/core';
import { ContextOptions } from '../../src/common/context-options';
import * as trackedConstruct from '../../src/common/tracked-construct';

import '@aws-cdk/assert/jest';

test('tracked construct add tracking code to description if not explicitely disabled', () => {

  // GIVEN
  const initialStackDescription = 'My Analytics stack';
  const trackingCode = 'trackingcode';
  const testApp = new App();
  const exampleStack = new Stack(testApp, 'testTrackedConstruct', {
    description: initialStackDescription,
  });

  // WHEN
  new trackedConstruct.TrackedConstruct(exampleStack, 'MyCoreAnalyticsConstruct', { trackingCode: trackingCode });

  // THEN
  expect(exampleStack.templateOptions).toHaveProperty('description', `${initialStackDescription} (${trackingCode})`);
});


test('tracked construct don\'t add tracking code to description if  explicitely disabled', () => {

  // GIVEN
  const initialStackDescription = 'My Analytics stack';
  const trackingCode = 'trackingcode';
  const context: any = {};
  context[ContextOptions.DISABLE_CONSTRUCTS_DEPLOYMENT_TRACKING] = true;
  const testApp = new App({ context });
  const exampleStack = new Stack(testApp, 'testTrackedConstruct', {
    description: initialStackDescription,
  });

  // WHEN
  new trackedConstruct.TrackedConstruct(exampleStack, 'MyCoreAnalyticsConstruct', { trackingCode: trackingCode });

  // THEN
  expect(exampleStack.templateOptions).toHaveProperty('description', initialStackDescription);
});