package com.geekoosh.flyway.response;

import org.flywaydb.core.api.MigrationInfo;
import org.flywaydb.core.api.MigrationInfoService;

public class ResponseInfo {
    private MigrationInfo current;
    private MigrationInfo[] applied;
    private MigrationInfo[] pending;

    public ResponseInfo() {
    }

    public ResponseInfo(MigrationInfoService info) {
        this.current = info.current();
        this.applied = info.applied();
        this.pending = info.pending();
    }

    public MigrationInfo getCurrent() {
        return current;
    }

    public void setCurrent(MigrationInfo current) {
        this.current = current;
    }

    public MigrationInfo[] getApplied() {
        return applied;
    }

    public void setApplied(MigrationInfo[] applied) {
        this.applied = applied;
    }

    public MigrationInfo[] getPending() {
        return pending;
    }

    public void setPending(MigrationInfo[] pending) {
        this.pending = pending;
    }
}
