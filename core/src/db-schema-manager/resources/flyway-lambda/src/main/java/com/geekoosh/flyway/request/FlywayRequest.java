package com.geekoosh.flyway.request;

import java.util.List;
import java.util.Map;

public class FlywayRequest {
    private Integer connectRetries = null;
    private String initSql;
    private List<String> schemas;
    private String table;
    private String tablespace;
    private String sqlMigrationPrefix;
    private String repeatableSqlMigrationPrefix;
    private String sqlMigrationSeparator;
    private List<String> sqlMigrationSuffixes;
    private String encoding;
    private Boolean placeholderReplacement = null;
    private Map<String, String> placeholders;
    private String placeholderPrefix;
    private String placeholderSuffix;
    private Boolean skipDefaultCallResolvers = null;
    private Boolean skipDefaultCallbacks = null;
    private String target;
    private Boolean outOfOrder = null;
    private Boolean validateOnMigrate = null;
    private Boolean cleanOnValidationError = null;
    private Boolean mixed = null;
    private Boolean group = null;
    private Boolean ignoreMissingMigrations = null;
    private Boolean ignoreIgnoredMigrations = null;
    private Boolean ignoreFutureMigrations = null;
    private Boolean cleanDisabled = null;
    private Boolean baselineOnMigrate = null;
    private String baselineVersion;
    private String baselineDescription;
    private String installedBy;
    private String configFile;
    private FlywayMethod flywayMethod;

    public Integer getConnectRetries() {
        return connectRetries;
    }

    public FlywayRequest setConnectRetries(Integer connectRetries) {
        this.connectRetries = connectRetries;
        return this;
    }

    public String getInitSql() {
        return initSql;
    }

    public FlywayRequest setInitSql(String initSql) {
        this.initSql = initSql;
        return this;
    }

    public List<String> getSchemas() {
        return schemas;
    }

    public FlywayRequest setSchemas(List<String> schemas) {
        this.schemas = schemas;
        return this;
    }

    public String getTable() {
        return table;
    }

    public FlywayRequest setTable(String table) {
        this.table = table;
        return this;
    }

    public String getTablespace() {
        return tablespace;
    }

    public FlywayRequest setTablespace(String tablespace) {
        this.tablespace = tablespace;
        return this;
    }

    public String getSqlMigrationPrefix() {
        return sqlMigrationPrefix;
    }

    public FlywayRequest setSqlMigrationPrefix(String sqlMigrationPrefix) {
        this.sqlMigrationPrefix = sqlMigrationPrefix;
        return this;
    }

    public String getRepeatableSqlMigrationPrefix() {
        return repeatableSqlMigrationPrefix;
    }

    public FlywayRequest setRepeatableSqlMigrationPrefix(String repeatableSqlMigrationPrefix) {
        this.repeatableSqlMigrationPrefix = repeatableSqlMigrationPrefix;
        return this;
    }

    public String getSqlMigrationSeparator() {
        return sqlMigrationSeparator;
    }

    public FlywayRequest setSqlMigrationSeparator(String sqlMigrationSeparator) {
        this.sqlMigrationSeparator = sqlMigrationSeparator;
        return this;
    }

    public List<String> getSqlMigrationSuffixes() {
        return sqlMigrationSuffixes;
    }

    public FlywayRequest setSqlMigrationSuffixes(List<String> sqlMigrationSuffixes) {
        this.sqlMigrationSuffixes = sqlMigrationSuffixes;
        return this;
    }

    public String getEncoding() {
        return encoding;
    }

    public FlywayRequest setEncoding(String encoding) {
        this.encoding = encoding;
        return this;
    }

    public Boolean getPlaceholderReplacement() {
        return placeholderReplacement;
    }

    public FlywayRequest setPlaceholderReplacement(Boolean placeholderReplacement) {
        this.placeholderReplacement = placeholderReplacement;
        return this;
    }

    public Map<String, String> getPlaceholders() {
        return placeholders;
    }

    public FlywayRequest setPlaceholders(Map<String, String> placeholders) {
        this.placeholders = placeholders;
        return this;
    }

    public String getPlaceholderPrefix() {
        return placeholderPrefix;
    }

    public FlywayRequest setPlaceholderPrefix(String placeholderPrefix) {
        this.placeholderPrefix = placeholderPrefix;
        return this;
    }

    public String getPlaceholderSuffix() {
        return placeholderSuffix;
    }

    public FlywayRequest setPlaceholderSuffix(String placeholderSuffix) {
        this.placeholderSuffix = placeholderSuffix;
        return this;
    }

    public Boolean getSkipDefaultCallResolvers() {
        return skipDefaultCallResolvers;
    }

    public FlywayRequest setSkipDefaultCallResolvers(Boolean skipDefaultCallResolvers) {
        this.skipDefaultCallResolvers = skipDefaultCallResolvers;
        return this;
    }

    public Boolean getSkipDefaultCallbacks() {
        return skipDefaultCallbacks;
    }

    public FlywayRequest setSkipDefaultCallbacks(Boolean skipDefaultCallbacks) {
        this.skipDefaultCallbacks = skipDefaultCallbacks;
        return this;
    }

    public String getTarget() {
        return target;
    }

    public FlywayRequest setTarget(String target) {
        this.target = target;
        return this;
    }

    public Boolean getOutOfOrder() {
        return outOfOrder;
    }

    public FlywayRequest setOutOfOrder(Boolean outOfOrder) {
        this.outOfOrder = outOfOrder;
        return this;
    }

    public Boolean getValidateOnMigrate() {
        return validateOnMigrate;
    }

    public FlywayRequest setValidateOnMigrate(Boolean validateOnMigrate) {
        this.validateOnMigrate = validateOnMigrate;
        return this;
    }

    public Boolean getCleanOnValidationError() {
        return cleanOnValidationError;
    }

    public FlywayRequest setCleanOnValidationError(Boolean cleanOnValidationError) {
        this.cleanOnValidationError = cleanOnValidationError;
        return this;
    }

    public Boolean getMixed() {
        return mixed;
    }

    public FlywayRequest setMixed(Boolean mixed) {
        this.mixed = mixed;
        return this;
    }

    public Boolean getGroup() {
        return group;
    }

    public FlywayRequest setGroup(Boolean group) {
        this.group = group;
        return this;
    }

    public Boolean getIgnoreMissingMigrations() {
        return ignoreMissingMigrations;
    }

    public FlywayRequest setIgnoreMissingMigrations(Boolean ignoreMissingMigrations) {
        this.ignoreMissingMigrations = ignoreMissingMigrations;
        return this;
    }

    public Boolean getIgnoreIgnoredMigrations() {
        return ignoreIgnoredMigrations;
    }

    public FlywayRequest setIgnoreIgnoredMigrations(Boolean ignoreIgnoredMigrations) {
        this.ignoreIgnoredMigrations = ignoreIgnoredMigrations;
        return this;
    }

    public Boolean getIgnoreFutureMigrations() {
        return ignoreFutureMigrations;
    }

    public FlywayRequest setIgnoreFutureMigrations(Boolean ignoreFutureMigrations) {
        this.ignoreFutureMigrations = ignoreFutureMigrations;
        return this;
    }

    public Boolean getCleanDisabled() {
        return cleanDisabled;
    }

    public FlywayRequest setCleanDisabled(Boolean cleanDisabled) {
        this.cleanDisabled = cleanDisabled;
        return this;
    }

    public Boolean getBaselineOnMigrate() {
        return baselineOnMigrate;
    }

    public FlywayRequest setBaselineOnMigrate(Boolean baselineOnMigrate) {
        this.baselineOnMigrate = baselineOnMigrate;
        return this;
    }

    public String getBaselineVersion() {
        return baselineVersion;
    }

    public FlywayRequest setBaselineVersion(String baselineVersion) {
        this.baselineVersion = baselineVersion;
        return this;
    }

    public String getBaselineDescription() {
        return baselineDescription;
    }

    public FlywayRequest setBaselineDescription(String baselineDescription) {
        this.baselineDescription = baselineDescription;
        return this;
    }

    public String getInstalledBy() {
        return installedBy;
    }

    public FlywayRequest setInstalledBy(String installedBy) {
        this.installedBy = installedBy;
        return this;
    }

    public String getConfigFile() {
        return configFile;
    }

    public FlywayRequest setConfigFile(String configFile) {
        this.configFile = configFile;
        return this;
    }

    public FlywayMethod getFlywayMethod() {
        return flywayMethod;
    }

    public FlywayRequest setFlywayMethod(FlywayMethod flywayMethod) {
        this.flywayMethod = flywayMethod;
        return this;
    }

    public static FlywayRequest build(FlywayRequest base) {
        if (base == null) {
            base = new FlywayRequest();
        }
        base.setConfigFile(ValueManager.value(
                base.getConfigFile(), EnvironmentVars.FLYWAY_CONFIG_FILE
        ));
        base.setFlywayMethod(ValueManager.value(
                base.getFlywayMethod(), EnvironmentVars.FLYWAY_METHOD,
                v -> v == null ? FlywayMethod.MIGRATE : FlywayMethod.valueOf(v)
        ));

        return base;
    }
}
