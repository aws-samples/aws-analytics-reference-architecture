package com.geekoosh.flyway;

import com.amazonaws.services.cloudformation.AmazonCloudFormationClientBuilder;
import com.amazonaws.services.cloudformation.model.*;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.CloudFormationCustomResourceEvent;
import com.geekoosh.flyway.request.*;
import com.geekoosh.flyway.response.Response;
import com.geekoosh.lambda.MigrationFilesException;
import com.geekoosh.lambda.MigrationFilesService;
import com.geekoosh.lambda.s3.S3Service;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import com.amazonaws.services.cloudformation.AmazonCloudFormation;


import java.security.InvalidParameterException;
import java.util.HashMap;
import java.util.Map;


public class FlywayCustomResourceHandler implements RequestHandler<CloudFormationCustomResourceEvent, Map> {
    private static final Logger logger = LogManager.getLogger(FlywayCustomResourceHandler.class);

    @Override
    public Map handleRequest(CloudFormationCustomResourceEvent event, Context context) {

        logger.info("onEventHandler event: " + event.toString());
        AmazonCloudFormation cloudFormationClient = AmazonCloudFormationClientBuilder.defaultClient();
        return handleRequest(event, cloudFormationClient);

    }

    public Map handleRequest(CloudFormationCustomResourceEvent event, AmazonCloudFormation cloudFormationClient) {
        String physicalResourceId = event.getPhysicalResourceId();
        String requestType = event.getRequestType();
        HashMap<String, Object> schemaVersion = new HashMap<>();
        schemaVersion.put("version", "0");
        switch (requestType) {
      /*
        For create requests, attempt to connect to the on-premise Active Directory
          using the AWS Directory Service.
      */
            case "Create":
            case "Update":
                DescribeStackResourceResult currentResource = cloudFormationClient.describeStackResource(new DescribeStackResourceRequest().withStackName(event.getStackId()).withLogicalResourceId(event.getLogicalResourceId()));
                String currentResourceStatus = currentResource.getStackResourceDetail().getResourceStatus();
                if(!currentResourceStatus.equals("UPDATE_ROLLBACK_IN_PROGRESS")) {
                    Response run = callFlywayService();
                    schemaVersion.put("version", run.getInfo().getCurrent().getVersion().getVersion());

                }
                break;
            case "Delete":
                break;
            default:
                throw new InvalidParameterException("Invalid RequestType " + requestType);
        }

        HashMap<String, Object> cfnResponse = new HashMap<>();

        cfnResponse.put("PhysicalResourceId", physicalResourceId);
        cfnResponse.put("RequestType", event.getRequestType());
        cfnResponse.put("Data", schemaVersion);

        System.out.println("result: Successfully " + event.getRequestType() + " migrations");
        System.out.println("response: " + cfnResponse);

        return cfnResponse;
    }

    public Response callFlywayService() {
        Request input = new Request().setFlywayRequest(new FlywayRequest().setFlywayMethod(FlywayMethod.MIGRATE));
        return new FlywayHandler().handleRequest(input, null);
    }
}
