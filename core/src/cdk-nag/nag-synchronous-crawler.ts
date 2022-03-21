import {App, Aspects, Stack} from '@aws-cdk/core';
import { SynchronousCrawler } from '../synchronous-crawler';
// eslint-disable-next-line import/no-extraneous-dependencies
import { AwsSolutionsChecks } from 'cdk-nag';


const mockApp = new App();

const crawlerStartWaitStack = new Stack(mockApp, 'synchronous-crawler');

// Instantiate a CrawlerStartWait custom resource
new SynchronousCrawler(crawlerStartWaitStack, 'CrawlerStartWaitTest', {
    crawlerName: 'test-crawler',
});

Aspects.of(crawlerStartWaitStack).add(new AwsSolutionsChecks({ verbose: true }));
