package com.geekoosh.lambda;

public class MigrationFilesException extends Exception {
    public MigrationFilesException(String message, Throwable cause) {
        super(message, cause);
    }
    public MigrationFilesException(Throwable cause) {
        super(cause);
    }
    public MigrationFilesException(String message) {
        super(message);
    }

}
