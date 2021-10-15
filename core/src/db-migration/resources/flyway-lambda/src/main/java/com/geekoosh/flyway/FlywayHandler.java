package com.geekoosh.flyway;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.geekoosh.flyway.request.*;
import com.geekoosh.flyway.response.Response;
import com.geekoosh.lambda.MigrationFilesException;
import com.geekoosh.lambda.MigrationFilesService;
import com.geekoosh.lambda.git.GitService;
import com.geekoosh.lambda.s3.S3Service;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

public class FlywayHandler implements RequestHandler<Request, Response> {
    private static final Logger logger = LogManager.getLogger(FlywayHandler.class);

    public GitService gitService(GitRequest gitRequest) {
        return new GitService(gitRequest);
    }

    @Override
    public Response handleRequest(Request input, Context context) {
        MigrationFilesService migrationFilesService = null;

        try {

            GitRequest gitRequest = GitRequest.build(input.getGitRequest());
            S3Request s3Request = S3Request.build(input.getS3Request());
            DBRequest dbRequest = DBRequest.build(input.getDbRequest());
            FlywayRequest flywayRequest = FlywayRequest.build(input.getFlywayRequest());


            GitService gitService = gitService(gitRequest);

            S3Service s3Service = new S3Service(
                    s3Request.getBucket(),
                    s3Request.getFolder()
            );

            if (s3Service.isValid()) {
                migrationFilesService = s3Service;
            } else if (gitService.isValid()) {
                migrationFilesService = gitService;
            }
            if(migrationFilesService != null) {
                migrationFilesService.prepare();
            }

            FlywayService flywayService = new FlywayService(flywayRequest, dbRequest, migrationFilesService);

            Response response = new Response(flywayService.call());
            response.log();
            return response;
        } catch(Exception e) {
            logger.error(e.getMessage(), e);
            throw new RuntimeException(e);
        } finally {
            if(migrationFilesService != null) try {
                migrationFilesService.clean();
            } catch (MigrationFilesException e) {
                logger.error(e.getMessage(), e);
                throw new RuntimeException(e);
            }
        }
    }
}
