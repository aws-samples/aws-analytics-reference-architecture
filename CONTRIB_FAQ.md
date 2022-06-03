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

## Project structure convention

Source code and related resources must be in `core/src` directory. There are 4 ways to organize your construct files.

1. **Construct with a single file.** For a very simple construct, it can be in a single file in `core/src` directory.

  ```
  core/src
    |- simple-construct-.ts # for class SimpleConstruct
    |- index.ts # Update the index file so that it's exported
  ```

2. **Construct with multiple files.** In most cases, your construct is not trivial and consists of multiple classes. Then you create a subdirectory with your construct name. If any of your constructs cannot be used stand-alone, they should be in the same directory.


  ```
  core/src
    |- notebook-construct
      |- notebook-construct.ts # Put the main class with the same name
      |- dependent-construct.ts # This construct must be used with notebook-construct.ts, so we keep them in the same directory. 
      |- subdir
        |- other-files.ts
      |- index.ts # Export any public classes here
  ```

3. **Construct with non-TypeScript files.** If you need to use these files (e.g. SQL files, Python script for Glue job, etc.), you have put them under `resources` directory. Otherwise, these files will not be exported to PyPi or NPM packages.

  ```

  core/src
    |- construct-with-script
      |- construct-with-script.ts 
      |- other-file-in.ts # Keep .ts files outside of `resources` to be clean
      |- resources # Unless you put the files in `resources` directory, they will not be copied to the exported package. 
        |- glue-script-1.py
        |- subdir-in-resources # All files in subdirectory are also copied.
          |- glue-script-2.py 
      |- index.ts 
  ```

  When referring to the file, use `__dirname` with relative. For example, if I want to refer to read the script from `construct-with-script.ts`. 

  ```
  //construct-with-script.ts
  import { readFileSync } from 'fs';
  import { join } from 'path';
  readFileSync(
    join(__dirname, 'resources/glue-script-1.py')
  );
  ```
  
  If you want to understand while `__dirname` is important, check "How non-TypeScript files are managed" are handled.

4. **Code shared by multiple constructs.** If your code is reused by multiple constructs from different subdirectory, keep it inside `common` directory. Use the same rule as placing them in `core/src` (including using `resources` directory).

  ```
  core/src
    |- common 
      |- class-or-function-used-by-many-constructs.ts
      |- group-of-components
         |- component-a.ts
         |- component-b.ts
  ```
 

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

A singleton resource can have different scope:
 * Across stacks: if you don't need to version it and it's the same resource across all AWS CDK Applications
 * Within stacks: if the resource can evolve across versions, it's preferable to scope it to a stack and assign a unique ID

#### Within stacks

The singleton pattern can be implemented using the unique ID of the AWS CDK node. Instead of creating a new resource from the AWS CDK Construct, a static `getOrCreate` method is used to retrieve the resource by search for the unique ID in the AWS CDK Scope. If no resource exists, the method creates a new one.

See the `SingletonBucket` Construct [here](./core/src/singleton-bucket.ts).

### How non-TypeScript files are included in the package
When you build the package, all TypeScript (.ts) files are transpiled to .js and copied from `src` to `lib`. 

By default, only .js files are copied to `lib`. If you have any other types of files, they will not be in the `lib`. This will cause your constructs to break with a file-not-found error.

To prevent that issue, we have a Projen task to copy other files from `src` to `lib` directory. This is run automatically when you run any Projen task. **We will copy only directories with the name `resources`.** Here is an example.

```
# Working directory
core/src
  |- construct-a
    |- construct-a.ts
    |- resources # All .sql (and any non-TS files) will be copied
      |- first.sql
        |- subdir
          |- second.sql 
  |- construct-b
    |- construct-b.ts
    |- third.sql # This file will not be copied as it is not in "resources" folder
```

The package will have this folder structure.

```
# In JSII package
lib
  |- construct-a
    |- construct-a.js 
    |- resources 
      |- first.sql
        |- subdir
          |- second.sql 
  |- construct-b 
    |- construct-b.js
    
# Note that there is no src dir
```

When our library is used in consumers' machines, the code paths will be like this. 

```
<project_path>
  |- consumer_project
    |- consumer__project_stack.py # Use our constructs from here

<jsii_temp_path>
  |-analytics-reference-architecture
    |- lib
      |- construct-a.js
      |- resources
        |- first.sql  # Relative reference like 'resources/first.sql' will not find this file
    
```

If `construct-a.js` uses relative path `resources/first.sql`. It will be relative from `<project_path>` not `<jsii_temp_path>`.  

To prevent this issue, we need to use `path.join(__dirname, 'resources/first.sql')` instead. `__dirname` will refer to the actual location of the file being executed, not the working directory.

### How to create a pre-bundled Python Lambda function?

Place your Lambda function code under `<construct-folder>/resources/lambdas/<lambdan-function-name>` folder. Projen will detect the new folder and bundle that during `npx projen build`. 

#### For python

It will copy all files to the same path in `lib` folder and install Python dependencies on any folder with `requirements.txt`. Our package will have all dependencies bundle and consumers do not have to install dependencies by themselves.

In the construct, create a Lambda function with `PreBundledFunction` construct to use the prebundled version. All of the parameter is the same as `lambda.Function`. The only difference is passing `codePath` prop instead of `code` with a relative path from `core/src`. The construct will use the right path with all dependencies when consumer is building. 

Here's an example:

```typescript
new PreBundledFunction(this, 'helloWordNumpy', {
    runtime: Runtime.PYTHON_3_8,
    codePath: '<construct-folder>/resources/lambdas/<lambdan-function-name>',
    handler: 'lambda.handler',
    logRetention: RetentionDays.ONE_DAY,
    timeout: Duration.seconds(30),
});
```

### For Java (Gradle)

It will copy all files to the same path in `lib` folder and call `./gradlew build shadowJar`  on any folder with `build.gradle`. Our package will have all dependencies bundle and consumers do not have to install java or dependencies by themselves.

Here's an example:

```typescript
new PreBundledFunction(this, 'runner', {
      codePath: path.join(__dirname.split('/').slice(-1)[0], './resources/flyway-lambda/build/libs/flyway-all.jar'),
      handler: 'com.geekoosh.flyway.FlywayCustomResourceHandler::handleRequest',
      runtime: lambda.Runtime.JAVA_11,
    });
```

### Why do we prebundle Python code for Lambda function?

Most of the data engineering code are written in Python. Even our CDK constructs are in TypeScript, we still use Python a lot in our Lambda functions. 

Normally, construct provider will **defer bundling step to construct consumers**. The provider only packages Python files and `requirements.txt` and distribute them. Consumers have to install and compile dependencies by themselves. The code looks like this:

```typescript
new PythonFunction(this, 'functionName', {
    runtime: Runtime.PYTHON_3_8,
    entry: '<construct-folder>/resources/lambdas/<function-name>',
    index: 'lambda.py',
    handler: 'handler',
});
```

This code is passed on to consumer. When they run  `cdk synth`, CDK will detect `requirements.txt` and download dependecies. Then CDK uploads the Python files and dependencies to an S3 bucket and create a CloudFormation template with link to it.

With this approach, consumers must set up Docker or their `cdk synth` will fail. Given the variety of audience we have for this reference architecture, we want to avoid additional prerequisite. (And support requests for Docker-related issues). 

Thus, we choose to prebundle Lambda function by installing all dependencies on provider's side. There are extra steps in Projen to copy Python files and install depedencies during the build. This way, consumers do not need bundle Lambda packages themselves.

## Testing

#### How to test CDK Constructs logic with a deployment in AWS Account?

AWS CDK logic can be tested by deploying a stack that instantiates AWS CDK components. Projen is configured to provide extra actions `test:deploy` and `test:destroy` to deploy in a testing account and destroy. [`./core/src/integ.default.ts`](./core/src/integ.default.ts) can be customized to deploy Constructs.

### How to test private class members or methods in Typescript?

Typescript allows to access private members and methods using this syntax `customDataset["sqlTable"]()`. See example of testing `sqlTable()`private method from `Dataset` class [here](./core/test/dataset.test.ts)

### How to test the core components library in local

 * Package the AWS Analytics Reference Architecture library. It will create `core/dist/js` and `core/dist/python` folders

```bash
npx projen package
```

 * For Python, create a new AWS CDK application in Python outside of this project and install a local dependency pointing to the `wheel` file in `core/dist/python`. In the `setup.py`, modify the dependencies like this

```python
    install_requires=[
        "aws-cdk.core==1.130.0",
        f"aws_analytics_reference_architecture @ file:///localhost<LOCAL_PATH>/aws-analytics-reference-architecture/core/dist/python/aws_analytics_reference_architecture-0.0.0-py3-none-any.whl",
    ],
```

