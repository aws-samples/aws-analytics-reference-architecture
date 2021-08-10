# Guidelines for contributing

Thank you for your interest in contributing to AWS documentation! We greatly value feedback and contributions from our community.

Please read through this document before you submit any pull requests or issues. It will help us work together more effectively.

## What to expect when you contribute

When you submit a pull request, our team is notified and will respond as quickly as we can. We'll do our best to work with you to ensure that your pull request adheres to our style and standards. If we merge your pull request, we might make additional edits later for style or clarity.

The AWS documentation source files on GitHub aren't published directly to the official documentation website. If we merge your pull request, we'll publish your changes to the documentation website as soon as we can, but they won't appear immediately or automatically.

We look forward to receiving your pull requests for:

* New content you'd like to contribute (such as new code samples or tutorials)
* Inaccuracies in the content
* Information gaps in the content that need more detail to be complete
* Typos or grammatical errors
* Suggested rewrites that improve clarity and reduce confusion

**Note:** We all write differently, and you might not like how we've written or organized something currently. We want that feedback. But please be sure that your request for a rewrite is supported by the previous criteria. If it isn't, we might decline to merge it.

## How to contribute

To contribute, send us a pull request. For small changes, such as fixing a typo or adding a link, you can use the [GitHub Edit Button](https://blog.github.com/2011-04-26-forking-with-the-edit-button/). For larger changes:

1. [Fork the repository](https://help.github.com/articles/fork-a-repo/).
2. In your fork, make your change in a branch that's based on this repo's **master** branch.
3. Commit the change to your fork, using a clear and descriptive commit message.
4. [Create a pull request](https://help.github.com/articles/creating-a-pull-request-from-a-fork/), answering any questions in the pull request form.

Before you send us a pull request, please be sure that:

1. You're working from the latest source on the **master** branch.
2. You check [existing open](https://github.com/awsdocs/${GITHUB_REPO}/pulls), and [recently closed](https://github.com/awsdocs/${GITHUB_REPO}/pulls?q=is%3Apr+is%3Aclosed), pull requests to be sure that someone else hasn't already addressed the problem.
3. You [create an issue](https://github.com/awsdocs/${GITHUB_REPO}/issues/new) before working on a contribution that will take a significant amount of your time.

For contributions that will take a significant amount of time, [open a new issue](https://github.com/awsdocs/${GITHUB_REPO}/issues/new) to pitch your idea before you get started. Explain the problem and describe the content you want to see added to the documentation. Let us know if you'll write it yourself or if you'd like us to help. We'll discuss your proposal with you and let you know whether we're likely to accept it. We don't want you to spend a lot of time on a contribution that might be outside the scope of the documentation or that's already in the works.

## Finding contributions to work on

If you'd like to contribute, but don't have a project in mind, look at the [open issues](https://github.com/awsdocs/${GITHUB_REPO}/issues) in this repository for some ideas. Any issues with the [help wanted](https://github.com/awsdocs/${GITHUB_REPO}/labels/help%20wanted) or [enhancement](https://github.com/awsdocs/${GITHUB_REPO}/labels/enhancement) labels are a great place to start.

In addition to written content, we really appreciate new examples and code samples for our documentation, such as examples for different platforms or environments, and code samples in additional languages.

## Contribution best practices

### Projen setup for Core components

1. Go into `core` folder
2. Install projen locally. Sometimes `projen` is installed globally and building throwns an error, deleting global `node_modules` folder solves the issue
    
    `npm install projen`
3. Build the core artificats
   
    `npx projen build`
4. Only run unit test
    
    `npx projen test`

### Git branch strategy

Create a branch based on the type of contribution:
 * build: Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)
 * ci: Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs)
 * docs: Documentation only changes
 * feat: A new feature
 * fix: A bug fix
 * perf: A code change that improves performance
 * refactor: A code change that neither fixes a bug nor adds a feature
 * style: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
 * test: Adding missing tests or correcting existing tests

### Git commit strategy

Put relevant type of contribution in the commit message. This message is used to determine the release type when merged into the `main` branch:
 * build: Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)
 * ci: Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs)
 * docs: Documentation only changes
 * feat: A new feature. Merging in `main` creates a new minor version
 * fix: A bug fix. Merging in `main` creates a new patched version
 * perf: A code change that improves performance
 * refactor: A code change that neither fixes a bug nor adds a feature
 * style: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
 * test: Adding missing tests or correcting existing tests
 * BREAKING CHANGE: introduces a breaking API change. Merging in `main` creates a new major version

`<type>: <description>`

### Documentation

* Typedoc (https://typedoc.org/guides/doccomments/) for code comments and API documentation in the framework (./core). See the `ExampleProps` interface and `Example` class [here](https://github.com/aws-samples/aws-analytics-reference-architecture/blob/main/core/src/example.ts)
* Pdoc3 (https://pdoc3.github.io/pdoc/) for code comments and API documentation of reference architectures (./refarch)

### Coding best practices and patterns

Please refer to the official CDK guidelines (https://github.com/aws/aws-cdk/blob/master/docs/DESIGN_GUIDELINES.md) for coding. An Example Construct is available in the repository to help you onboard.

#### Customizable Constructs defaults parameters

AWS CDK Constructs are abstractions with built-in best practices that can be overriden with custom configurations to allow extensibility. Use optional Props parameters in the interface and defaults Props values in the CDK Construct constructor. Document default values in the Props interface documentation.

See the `ExampleProps` interface and `Example` class [here](https://github.com/aws-samples/aws-analytics-reference-architecture/blob/main/core/src/example.ts). `name` and `value` are optional parameters of the interface. In the `Example` class constructor, `name` and `value` existance are tested and default parameters are used if they are not provided to the Props.

#### Pre-defined CDK objects

Use Typescript `public static readonly` objects to store pre-defined objects like available Datasets.

TODO: add example

## Code of conduct

This project has adopted the [Amazon Open Source Code of Conduct](https://aws.github.io/code-of-conduct). For more information, see the [Code of Conduct FAQ](https://aws.github.io/code-of-conduct-faq) or contact [opensource-codeofconduct@amazon.com](mailto:opensource-codeofconduct@amazon.com) with any additional questions or comments.

## Security issue notifications

If you discover a potential security issue, please notify AWS Security via our [vulnerability reporting page](http://aws.amazon.com/security/vulnerability-reporting/). Please do **not** create a public issue on GitHub.

## Licensing

See the [LICENSE](https://github.com/awsdocs/${GITHUB_REPO}/blob/master/LICENSE) file for this project's licensing. We will ask you to confirm the licensing of your contribution. We may ask you to sign a [Contributor License Agreement (CLA)](http://en.wikipedia.org/wiki/Contributor_License_Agreement) for larger changes.