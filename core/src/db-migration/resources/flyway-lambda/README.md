[![Build Status](https://travis-ci.org/Geekoosh/flyway-lambda.svg?branch=master)](https://travis-ci.org/Geekoosh/flyway-lambda)

Deploy Flyway as an AWS Lambda within your VPC with access to your RDS database.

## Migration files
flyway-lambda fetches the migration scripts from either a Git repo or from an S3 bucket.

## Configuration
Lambda supports Flyway configuration via Lambda invocation json request, [environment variables](https://flywaydb.org/documentation/envvars) and [config files](https://flywaydb.org/documentation/configfiles).

### Git
flyway-lambda supports pulling migration scripts from a Git repo given Git repo, branch name, username, and password.
The Lambda clones the repo on its storage and applies the migration scripts over the database.
For more information, check the [Git Configuration](https://github.com/Geekoosh/flyway-lambda/wiki/Git-Configuration)

For a full flyway-lambda deployment with a Git repo access check the [CloudFormation example](https://github.com/Geekoosh/flyway-lambda/tree/master/examples/flyway-git)

### S3
flyway-lambda can also pull the migration scripts from an S3 bucket. For more information, check [S3 Configuration](https://github.com/Geekoosh/flyway-lambda/wiki/S3-Configuration).
For a full flyway-lambda deployment with S3 bucket check the [CloudFormation example](https://github.com/Geekoosh/flyway-lambda/tree/master/examples/flyway-s3)

### DB Support
flyway-lambda supports updating MySQL and Postgres databases, including Aurora.
For DB credentials use the Lambda invocation request object, environment variables or secrets manager. For more information, check [RDS Configuration](https://github.com/Geekoosh/flyway-lambda/wiki/RDS-Configuration).
**Please note, don't use the configuration for DB in Flyway**

### Flyway methods
flyway-lambda supports the full range of Flyway functionality, including migrate, info, baseline, clean, repair, and validate.
For more information, check [Flyway Configuration](https://github.com/Geekoosh/flyway-lambda/wiki/Flyway-Configuration).

Flyway config files can also reside in s3 or within your git repo

## Logging
flyway-lambda logs to CloudWatch.
For more information, check [Logging](https://github.com/Geekoosh/flyway-lambda/wiki/Logging).
