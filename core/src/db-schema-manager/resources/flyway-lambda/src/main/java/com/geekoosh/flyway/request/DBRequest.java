package com.geekoosh.flyway.request;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.json.JSONObject;

public class DBRequest {
    private static final Logger logger = LogManager.getLogger(DBRequest.class);
    private String username;
    private String password;
    private String connectionString;

    public String getUsername() {
        return username;
    }

    public DBRequest setUsername(String username) {
        this.username = username;
        return this;
    }

    public String getPassword() {
        return password;
    }

    public DBRequest setPassword(String password) {
        this.password = password;
        return this;
    }

    public String getConnectionString() {
        return connectionString;
    }

    public DBRequest setConnectionString(String connectionString) {
        this.connectionString = connectionString;
        return this;
    }

    public static DBRequest build(DBRequest base) {
        if(base == null) {
            base = new DBRequest();
        }
        SystemEnvironment systemEnvironment = new SystemEnvironment();
        String dbSecret = systemEnvironment.getEnv(SecretVars.DB_SECRET);
        if(dbSecret != null) {
            JSONObject json = ValueManager.latestSecretJson(dbSecret);
            base.setUsername(json.get("username").toString());
            base.setPassword(json.get("password").toString());
        } else {
            base.setUsername(ValueManager.value(
                    base.getUsername(), EnvironmentVars.DB_USERNAME
            ));
            base.setPassword(ValueManager.value(
                    base.getPassword(), EnvironmentVars.DB_PASSWORD
            ));
        }
        base.setConnectionString(ValueManager.value(
                base.getConnectionString(), EnvironmentVars.DB_CONNECTION_STRING
        ));
        return base;
    }
}
