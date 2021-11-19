package com.geekoosh.flyway;

import com.amazonaws.services.s3.model.S3Object;
import com.geekoosh.flyway.request.DBRequest;
import com.geekoosh.flyway.request.FlywayRequest;
import com.geekoosh.lambda.MigrationFilesService;
import com.geekoosh.lambda.s3.S3Service;
import org.apache.commons.lang3.builder.ReflectionToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.MigrationInfoService;
import org.flywaydb.core.api.configuration.Configuration;
import org.flywaydb.core.api.configuration.FluentConfiguration;

import java.io.*;
import java.net.URL;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Properties;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

public class FlywayService {
    private static final Logger logger = LogManager.getLogger(FlywayService.class);
    private FlywayRequest flywayRequest;
    private DBRequest dbRequest;
    private List<String> folders;
    private MigrationFilesService migrationFilesService;

    public FlywayService(FlywayRequest flywayRequest, DBRequest dbRequest, MigrationFilesService migrationFilesService) {
        this.flywayRequest = flywayRequest;
        this.dbRequest = dbRequest;
        this.migrationFilesService = migrationFilesService;
        if(migrationFilesService != null) {
            this.folders = migrationFilesService.getFolders();
        }
    }

    private InputStream urlStream(String url) throws IOException {
        String S3_PREFIX = "s3://";
        String LOCAL_PREFIX = "file://";
        if(url.startsWith(S3_PREFIX)) {
            url = url.substring(S3_PREFIX.length());
            String[] parts = url.split("/");
            String bucket = parts[0];
            String path = String.join("/", Arrays.copyOfRange(parts, 1, parts.length));
            S3Object s3object = S3Service.getS3Client().getObject(bucket, path);
            return s3object.getObjectContent();
        } else if(url.startsWith(LOCAL_PREFIX)) {
            return new FileInputStream(this.migrationFilesService.getPath(url.substring(LOCAL_PREFIX.length())));
        } else {
            return new URL(url).openStream();
        }
    }

    private Properties loadConfig(String url) throws IOException {
        Properties prop = new Properties();
        prop.load(urlStream(url));
        return prop;
    }

    private void dumpConfiguration(Flyway flyway) {
        String configDump = new ReflectionToStringBuilder(flyway.getConfiguration(), ToStringStyle.MULTI_LINE_STYLE)
                .setExcludeFieldNames("password").toString();

        logger.info("Flyway configuration: " + configDump);
    }

    public List<String> getMigrationFiles(Flyway flyway) {
        Configuration config = flyway.getConfiguration();
        String migrationPattern = String.format(
                "%s\\d+%s.*[%s]",
                config.getSqlMigrationPrefix(),
                config.getSqlMigrationSeparator(),
                String.join("|", Arrays.stream(
                        config.getSqlMigrationSuffixes())
                        .map(s -> s.replace(".", "\\.")).collect(Collectors.toList()))
        );

        final Pattern p = Pattern.compile(migrationPattern);

        ArrayList<String> filenames = new ArrayList<>();
        for(String folder : folders) {
            File[] files = new File(folder).listFiles(f -> p.matcher(f.getName()).matches());
            if(files != null) {
                Arrays.asList(files).forEach(f -> filenames.add(f.getPath()));
            }
        }
        return filenames;
    }

    private void logMigrationFiles(Flyway flyway) {
        List<String> filenames = getMigrationFiles(flyway);
        logger.info(String.format("Migration files: %s", String.join(", ", filenames)));
    }

    public Flyway configure() throws IOException {
        FluentConfiguration config = Flyway.configure().dataSource(
                dbRequest.getConnectionString(),
                dbRequest.getUsername(),
                dbRequest.getPassword()
        );

        if(folders != null) {
            config.locations(folders.stream().map(f -> "filesystem:" + f)
                    .collect(Collectors.toList()).toArray(new String[0]));
        }

        if(flywayRequest.getConfigFile() != null) {
            Properties props = loadConfig(flywayRequest.getConfigFile());
            config = config.configuration(props);
        }
        config = config.envVars();

        if(flywayRequest.getInitSql() != null) {
            config.initSql(flywayRequest.getInitSql());
        }
        if(flywayRequest.getTable() != null) {
            config.table(flywayRequest.getTable());
        }
        if(flywayRequest.getTablespace() != null) {
            config.tablespace(flywayRequest.getTablespace());
        }
        if(flywayRequest.getSqlMigrationPrefix() != null) {
            config.sqlMigrationPrefix(flywayRequest.getSqlMigrationPrefix());
        }
        if(flywayRequest.getRepeatableSqlMigrationPrefix() != null) {
            config.repeatableSqlMigrationPrefix(flywayRequest.getRepeatableSqlMigrationPrefix());
        }
        if(flywayRequest.getSqlMigrationSeparator() != null) {
            config.sqlMigrationSeparator(flywayRequest.getSqlMigrationSeparator());
        }
        if(flywayRequest.getEncoding() != null) {
            config.encoding(flywayRequest.getEncoding());
        }
        if(flywayRequest.getTarget() != null) {
            config.target(flywayRequest.getTarget());
        }
        if(flywayRequest.getPlaceholderPrefix() != null) {
            config.placeholderPrefix(flywayRequest.getPlaceholderPrefix());
        }
        if(flywayRequest.getPlaceholderSuffix() != null) {
            config.placeholderSuffix(flywayRequest.getPlaceholderSuffix());
        }
        if(flywayRequest.getBaselineVersion() != null) {
            config.baselineVersion(flywayRequest.getBaselineVersion());
        }
        if(flywayRequest.getBaselineDescription() != null) {
            config.baselineDescription(flywayRequest.getBaselineDescription());
        }
        if(flywayRequest.getInstalledBy() != null) {
            config.installedBy(flywayRequest.getInstalledBy());
        }
        if(flywayRequest.getConnectRetries() != null) {
            config.connectRetries(flywayRequest.getConnectRetries());
        }
        if(flywayRequest.getSchemas() != null) {
            config.schemas(flywayRequest.getSchemas().toArray(new String[0]));
        }
        if(flywayRequest.getSqlMigrationSuffixes() != null) {
            config.sqlMigrationSuffixes(flywayRequest.getSqlMigrationSuffixes().toArray(new String[0]));
        }
        if(flywayRequest.getPlaceholderReplacement() != null) {
            config.placeholderReplacement(flywayRequest.getPlaceholderReplacement());
        }
        if(flywayRequest.getSkipDefaultCallResolvers() != null) {
            config.skipDefaultResolvers(flywayRequest.getSkipDefaultCallResolvers());
        }
        if(flywayRequest.getSkipDefaultCallbacks() != null) {
            config.skipDefaultCallbacks(flywayRequest.getSkipDefaultCallbacks());
        }
        if(flywayRequest.getOutOfOrder() != null) {
            config.outOfOrder(flywayRequest.getOutOfOrder());
        }
        if(flywayRequest.getValidateOnMigrate() != null) {
            config.validateOnMigrate(flywayRequest.getValidateOnMigrate());
        }
        if(flywayRequest.getCleanOnValidationError() != null) {
            config.cleanOnValidationError(flywayRequest.getCleanOnValidationError());
        }
        if(flywayRequest.getMixed() != null) {
            config.mixed(flywayRequest.getMixed());
        }
        if(flywayRequest.getGroup() != null) {
            config.group(flywayRequest.getGroup());
        }
        if(flywayRequest.getIgnoreMissingMigrations() != null) {
            config.ignoreMissingMigrations(flywayRequest.getIgnoreMissingMigrations());
        }
        if(flywayRequest.getIgnoreIgnoredMigrations() != null) {
            config.ignoreIgnoredMigrations(flywayRequest.getIgnoreIgnoredMigrations());
        }
        if(flywayRequest.getIgnoreFutureMigrations() != null) {
            config.ignoreFutureMigrations(flywayRequest.getIgnoreFutureMigrations());
        }
        if(flywayRequest.getCleanDisabled() != null) {
            config.cleanDisabled(flywayRequest.getCleanDisabled());
        }
        if(flywayRequest.getBaselineOnMigrate() != null) {
            config.baselineOnMigrate(flywayRequest.getBaselineOnMigrate());
        }
        if(flywayRequest.getPlaceholders() != null) {
            config.placeholders(flywayRequest.getPlaceholders());
        }

        Flyway flyway = config.load();
        dumpConfiguration(flyway);
        return flyway;
    }
    public void migrate() throws IOException {
        if(folders == null) {
            throw new RuntimeException("Both S3 and Git repositories missing configuration");
        }
        Flyway flyway = configure();
        logger.info("Migration scripts from folders: " + String.join(",", folders));
        logMigrationFiles(flyway);
        flyway.migrate();
    }
    public void baseline() throws IOException {
        Flyway flyway = configure();
        flyway.baseline();
    }
    public void repair() throws IOException {
        Flyway flyway = configure();
        flyway.repair();
    }
    public void clean() throws IOException {
        Flyway flyway = configure();
        flyway.clean();
    }
    public MigrationInfoService info() throws IOException {
        Flyway flyway = configure();
        return flyway.info();
    }
    public void validate() throws IOException {
        Flyway flyway = configure();
        flyway.validate();
    }
    public MigrationInfoService call() throws IOException {
        switch (flywayRequest.getFlywayMethod()) {
            case MIGRATE:
                logger.info("Running migration");
                migrate();
                break;
            case INFO:
                logger.info("Running info");
                return info();
            case BASELINE:
                logger.info("Running baseline");
                baseline();
                break;
            case CLEAN:
                logger.info("Running clean");
                clean();
                break;
            case REPAIR:
                logger.info("Running repair");
                repair();
                break;
            case VALIDATE:
                logger.info("Running validate");
                validate();
                break;
        }
        return info();
    }
}
