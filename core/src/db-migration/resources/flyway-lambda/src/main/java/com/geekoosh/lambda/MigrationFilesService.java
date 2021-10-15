package com.geekoosh.lambda;

import java.util.List;

public interface MigrationFilesService {
    boolean isValid();
    void prepare() throws MigrationFilesException;
    List<String> getFolders();
    void clean() throws MigrationFilesException;
    String getPath(String path);
}
