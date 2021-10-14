# Contribution best practices

## Project build

### How to setup Projen for Core components?

1. Go into `core` folder
2. Install projen locally. Sometimes `projen` is installed globally and building throwns an error, deleting global `node_modules` folder solves the issue
    
    `npm install projen`
3. Build the core artificats
   
    `npx projen build`
4. Only run unit test
    
    `npx projen test`

## Git strategy

### What Git branch strategy to use?

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

### Which message to use in Git commit?

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

## Documentation

### How to document code?

* Typedoc (https://typedoc.org/guides/doccomments/) for code comments and API documentation in the framework (./core). See the `ExampleProps` interface and `Example` class [here](https://github.com/aws-samples/aws-analytics-reference-architecture/blob/main/core/src/example.ts)
* Pdoc3 (https://pdoc3.github.io/pdoc/) for code comments and API documentation of reference architectures (./refarch)

## CDK best practices

### What are the coding best practices and patterns with CDK

Please refer to the official CDK guidelines (https://github.com/aws/aws-cdk/blob/master/docs/DESIGN_GUIDELINES.md) for coding. An Example Construct is available in the repository to help you onboard.

#### How to implement Constructs with defaults but customizable parameters?

AWS CDK Constructs are abstractions with built-in best practices that can be overriden with custom configurations to allow extensibility. Use optional Props parameters in the interface and defaults Props values in the CDK Construct constructor. Document default values in the Props interface documentation.

See the `ExampleProps` interface and `Example` class [here](https://github.com/aws-samples/aws-analytics-reference-architecture/blob/main/core/src/example.ts). `name` and `value` are optional parameters of the interface. In the `Example` class constructor, `name` and `value` existance are tested and default parameters are used if they are not provided to the Props.

#### How to provide pre-defined CDK objects?

Use Typescript `public static readonly` objects to store pre-defined objects like available Datasets.

See the `Dataset` class using static variables call the class constructor [here](./core/src/dataset.ts).

### How to implement Singleton pattern for an AWS CDK resource

The singleton pattern can be implemented using the unique ID of the AWS CDK node. Instead of creating a new resource from the AWS CDK Construct, a static `getOrCreate` method is used to retrieve the resource by search for the unique ID in the AWS CDK Scope. If no resource exists, the method creates a new one.

See the `SingletonBucket` Construct [here](./core/src/singleton-bucket.ts).

### How to create a pre-bundled Python Lambda function?

Place your Lambda function code under `<construct-folder>/resources/lambdas/<lambdan-function-name>` folder. Projen will detect the new folder and bundle that during `npx projen build`. 

It will copy all files to the same path in `lib` folder and install Python dependencies on any folder with `requirements.txt`. Our package will have all dependencies bundle and consumers do not have to install dependencies by themselves.

In the construct, create a Lambda function with `PreBundledFunction` construct to use the prebundled version. All of the parameter is the same as `lambda.Function`. The only difference is passing `codePath` prop instead of `code` with a relative path from `core/src`. The construct will use the right path with all dependencies when consumer is building. 

Here's an example:

```
new PreBundledFunction(this, 'helloWordNumpy', {
    runtime: Runtime.PYTHON_3_8,
    codePath: '<construct-folder>/resources/lambdas/<lambdan-function-name>',
    handler: 'lambda.handler',
    logRetention: RetentionDays.ONE_DAY,
    timeout: Duration.seconds(30),
});
```
### Why do we prebundle Python code for Lambda function?

Most of the data engineering code are written in Python. Even our CDK constructs are in TypeScript, we still use Python a lot in our Lambda functions. 

Normally, construct provider will **defer bundling step to construct consumers**. The provider only packages Python files and `requirements.txt` and distribute them. Consumers have to install and compile dependencies by themselves. The code looks like this:

```
new PythonFunction(this, 'functionName', {
    runtime: Runtime.PYTHON_3_8,
    entry: '<construct-folder>/resources/lambdas/<function-name>',
    index: 'lambda.py',
    handler: 'handler',
});
```

This code is passed on to consumer. When they run  `cdk synth`, CDK will detect `requirements.txt` and download dependecies. Then CDK uploads the Python files and dependencies to an S3 bucket and create a CloudFormation template with link to it.

With this approach, consumers must set up Docker or their `cdk synth` will fail. Given the variety of audience we have for this reference architecture, we want to avoid additional prerequisite. (And support requests for Docker-related issues). 

Thus, we choose to prebundle Lambda function by installing all dependencies on provider's side. There are extra steps in Projen to copy PYthon files and install depedencies during the build. This way, consumers do not need bundle Lambda packages themselves.

## Testing

#### How to test CDK Constructs logic with a deployment in AWS Account?

AWS CDK logic can be tested by deploying a stack that instantiates AWS CDK components. Projen is configured to provide extra actions `test:deploy` and `test:destroy` to deploy in a testing account and destroy. [`./core/src/integ.default.ts`](./core/src/integ.default.ts) can be customized to deploy Constructs.

### How to test private class members or methods in Typescript?

Typescript allows to access private members and methods using this syntax `customDataset["sqlTable"]()`. See example of testing `sqlTable()`private method from `Dataset` class [here](./core/test/dataset.test.ts)