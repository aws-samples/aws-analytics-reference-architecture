package com.geekoosh.lambda.s3;

import com.amazonaws.AmazonClientException;
import com.amazonaws.AmazonServiceException;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.transfer.*;
import com.geekoosh.lambda.MigrationFilesException;
import com.geekoosh.lambda.MigrationFilesService;
import org.apache.commons.io.FileUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.io.File;
import java.io.IOException;
import java.util.Collections;
import java.util.List;

public class S3Service implements MigrationFilesService {
    private static final Logger logger = LogManager.getLogger(S3Service.class);
    private static final String basePath = "/tmp";

    private String bucket;
    private String folder;
    private File dataDirectory;

    private static AmazonS3 amazonS3;

    public static void setAmazonS3(AmazonS3 amazonS3) {
        S3Service.amazonS3 = amazonS3;
    }

    public static AmazonS3 getS3Client() {
        if(S3Service.amazonS3 != null) {
            return S3Service.amazonS3;
        }
        AmazonS3ClientBuilder builder = AmazonS3ClientBuilder
                .standard()
                .withRegion(System.getenv("AWS_REGION"));
        amazonS3 = builder.build();
        return amazonS3;
    }

    public S3Service(String localRepo, String bucket, String folder) {
        this.bucket = bucket;
        this.folder = folder;
        this.dataDirectory = new File(basePath + "/" + localRepo);
    }

    public static void waitForCompletion(Transfer xfer) throws MigrationFilesException {
        try {
            xfer.waitForCompletion();
        } catch (AmazonServiceException e) {
            throw new MigrationFilesException("Amazon service error", e);
        } catch (AmazonClientException e) {
            throw new MigrationFilesException("Amazon client error", e);
        } catch (InterruptedException e) {
            throw new MigrationFilesException("Transfer interrupted", e);
        }
    }

    public S3Service(String bucket, String folder) {
        this(bucket, bucket, folder);
    }
    public void download() throws MigrationFilesException {
        TransferManager xfer_mgr = TransferManagerBuilder.standard().withS3Client(S3Service.getS3Client()).build();
        MultipleFileDownload d = xfer_mgr.downloadDirectory(bucket, folder, dataDirectory);
        S3Service.waitForCompletion(d);
        Transfer.TransferState xfer_state = d.getState();
        logger.info(xfer_state);
        xfer_mgr.shutdownNow(false);
    }

    @Override
    public boolean isValid() {
        return this.bucket != null;
    }

    @Override
    public void prepare() throws MigrationFilesException {
        download();
    }

    @Override
    public List<String> getFolders() {
        return Collections.singletonList(this.dataDirectory.getPath());
    }

    @Override
    public void clean() throws MigrationFilesException {
        try {
            FileUtils.deleteDirectory(dataDirectory);
        } catch (IOException e) {
            throw new MigrationFilesException("Failed deleting existing s3 directory", e);
        }
    }

    @Override
    public String getPath(String path) {
        return null;
    }
}
