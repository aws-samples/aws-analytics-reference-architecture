package com.geekoosh.flyway.request;

public class S3Request {
    private String bucket;
    private String folder;

    public String getBucket() {
        return bucket;
    }

    public void setBucket(String bucket) {
        this.bucket = bucket;
    }

    public String getFolder() {
        return folder;
    }

    public void setFolder(String folder) {
        this.folder = folder;
    }

    public static S3Request build(S3Request base) {
        if(base == null) {
            base = new S3Request();
        }
        base.setBucket(ValueManager.value(base.getBucket(), EnvironmentVars.S3_BUCKET));
        base.setFolder(ValueManager.value(base.getFolder(), EnvironmentVars.S3_FOLDER));
        return base;
    }
}
