package com.geekoosh.flyway.request;

public class SystemEnvironment {
    public String getEnv(EnvironmentVars var) {
        return System.getenv(var.name());
    }
    public String getEnv(SecretVars var) {
        return System.getenv(var.name());
    }
}
