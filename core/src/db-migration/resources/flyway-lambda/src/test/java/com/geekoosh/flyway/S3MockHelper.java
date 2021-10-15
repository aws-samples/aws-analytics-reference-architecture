package com.geekoosh.flyway;

import com.amazonaws.services.s3.AmazonS3;

import java.io.File;
import java.io.IOException;
import java.io.StringWriter;
import java.util.Properties;

public class S3MockHelper {
    private AmazonS3 s3;

    public S3MockHelper(AmazonS3 s3) {
        this.s3 = s3;
    }

    public void uploadConfig(Properties confProps, String bucket, String key) throws IOException {
        StringWriter writer = new StringWriter();
        confProps.store(writer, "flyway");
        s3.putObject(bucket, key, writer.toString());
    }
    public void upload(File file, String bucket, String key) {
        s3.putObject(bucket, key, file);
    }
}
