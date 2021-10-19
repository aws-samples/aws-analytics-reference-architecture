package com.geekoosh.flyway.request;

public enum EnvironmentVars {
    DB_USERNAME,
    DB_PASSWORD,
    DB_CONNECTION_STRING,

    GIT_USERNAME,
    GIT_PASSWORD,
    GIT_REPOSITORY,
    GIT_BRANCH,
    GIT_FOLDERS,
    GIT_REUSE_REPO,

    S3_BUCKET,
    S3_FOLDER,

    FLYWAY_CONFIG_FILE,
    FLYWAY_METHOD,

    AWS_REGION,
}
