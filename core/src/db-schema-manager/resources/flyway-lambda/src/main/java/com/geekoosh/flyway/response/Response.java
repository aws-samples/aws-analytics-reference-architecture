package com.geekoosh.flyway.response;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.flywaydb.core.api.MigrationInfoService;

import java.util.Arrays;
import java.util.stream.Collectors;

public class Response {
    private static final Logger logger = LogManager.getLogger(Response.class);
    private ResponseInfo info;

    public Response(MigrationInfoService info) {
        this.info = new ResponseInfo(info);
    }

    public Response() {}

    public ResponseInfo getInfo() {
        return info;
    }

    public void setInfo(ResponseInfo info) {
        this.info = info;
    }

    public void log() {
        if(info == null) {
            logger.warn("No info available for this action");
            return;
        }
        String logInfo = "";
        if(info.getCurrent() != null) {
            logInfo = String.format("Current version: %s\n",
                    info.getCurrent().getVersion().getVersion()
            );
        }
        if(info.getApplied() != null) {
            logInfo += String.format("Applied migrations: %s, %s\n",
                    info.getApplied().length,
                    Arrays.stream(info.getApplied()).map(my -> "(" + (my.getVersion() == null ? "" : my.getVersion().getVersion()) + " [" + my.getScript() + "])")
                            .collect(Collectors.joining(", "))
            );
        }
        if(info.getPending() != null) {
            logInfo += String.format("Pending migrations: %s, %s\n",
                    info.getPending().length,
                    Arrays.stream(info.getPending()).map(my -> "(" + my.getVersion().getVersion() + " [" + my.getScript() + "])")
                            .collect(Collectors.joining(", "))
            );
        }
        logger.info(logInfo);
    }
}
