package com.geekoosh.flyway.request;

public class Request {
    private GitRequest gitRequest;

    private S3Request s3Request;

    private DBRequest dbRequest;

    private FlywayRequest flywayRequest;

    public GitRequest getGitRequest() {
        return gitRequest;
    }

    public Request setGitRequest(GitRequest gitRequest) {
        this.gitRequest = gitRequest;
        return this;
    }

    public DBRequest getDbRequest() {
        return dbRequest;
    }

    public Request setDbRequest(DBRequest dbRequest) {
        this.dbRequest = dbRequest;
        return this;
    }

    public S3Request getS3Request() {
        return s3Request;
    }

    public Request setS3Request(S3Request s3Request) {
        this.s3Request = s3Request;
        return this;
    }

    public FlywayRequest getFlywayRequest() {
        return flywayRequest;
    }

    public Request setFlywayRequest(FlywayRequest flywayRequest) {
        this.flywayRequest = flywayRequest;
        return this;
    }
}
