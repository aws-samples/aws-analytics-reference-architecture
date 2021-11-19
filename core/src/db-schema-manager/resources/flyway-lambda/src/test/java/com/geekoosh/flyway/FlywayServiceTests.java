package com.geekoosh.flyway;

import com.adobe.testing.s3mock.S3MockRule;
import com.amazonaws.services.s3.AmazonS3;
import com.geekoosh.flyway.request.DBRequest;
import com.geekoosh.flyway.request.FlywayRequest;
import com.geekoosh.lambda.MigrationFilesService;
import com.geekoosh.lambda.git.GitService;
import com.geekoosh.lambda.s3.S3Service;
import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.Location;
import org.flywaydb.core.api.configuration.Configuration;
import org.junit.Before;
import org.junit.ClassRule;
import org.junit.Rule;
import org.junit.Test;
import org.junit.contrib.java.lang.system.EnvironmentVariables;
import org.junit.runner.RunWith;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.testcontainers.containers.MySQLContainer;

import static org.junit.Assert.*;

import java.io.IOException;
import java.util.Arrays;
import java.util.Properties;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@RunWith(MockitoJUnitRunner.class)
public class FlywayServiceTests {
    @Rule
    public final EnvironmentVariables environmentVariables
            = new EnvironmentVariables();

    @ClassRule
    public static S3MockRule S3_MOCK_RULE = new S3MockRule();

    private final AmazonS3 s3 = S3_MOCK_RULE.createS3Client();

    @Before
    public void setUp() throws IOException {
        Properties confProps = new Properties();
        confProps.setProperty("flyway.sqlMigrationPrefix", "F");
        S3MockHelper s3MockHelper = new S3MockHelper(s3);
        s3MockHelper.uploadConfig(confProps, "Bucket-1", "flyway/config.props");
        s3.putObject("Bucket-1", "flyway/bad-config.props", "vary bad string");
    }

    private MySQLContainer mySQLContainer() {
        return new MySQLContainer<>().withUsername("username").withPassword("password").withDatabaseName("testdb");
    }

    @Test
    public void testConfigure() throws IOException {
        MigrationFilesService migrationFilesService = Mockito.mock(GitService.class);
        Mockito.when(migrationFilesService.getFolders()).thenReturn(Arrays.asList("folder1", "folder2"));
        try (MySQLContainer mysql = mySQLContainer()) {
            mysql.start();
            S3Service.setAmazonS3(s3);
            String connectionString = mysql.getJdbcUrl();
            DBRequest dbRequest = new DBRequest().setUsername("user").setPassword("password").setConnectionString(connectionString);

            FlywayService flywayService = new FlywayService(
                    FlywayRequest.build(null),
                    dbRequest,
                    migrationFilesService
            );
            Flyway flyway = flywayService.configure();
            Configuration conf = flyway.getConfiguration();
            assertEquals(Arrays.asList("folder1", "folder2"),
                    Stream.of(conf.getLocations()).map(Location::getPath).collect(Collectors.toList()));
            assertEquals("V", conf.getSqlMigrationPrefix());

            environmentVariables.set("FLYWAY_CONFIG_FILE", "s3://Bucket-1/flyway/config.props");
            flywayService = new FlywayService(
                    FlywayRequest.build(null),
                    dbRequest,
                    migrationFilesService
            );
            flyway = flywayService.configure();
            conf = flyway.getConfiguration();
            assertEquals("F", conf.getSqlMigrationPrefix());

            environmentVariables.set("FLYWAY_SQL_MIGRATION_PREFIX", "P");
            flywayService = new FlywayService(
                    FlywayRequest.build(null),
                    dbRequest,
                    migrationFilesService
            );
            flyway = flywayService.configure();
            conf = flyway.getConfiguration();
            assertEquals("P", conf.getSqlMigrationPrefix());

            flywayService = new FlywayService(
                    FlywayRequest.build(new FlywayRequest().setSqlMigrationPrefix("T")),
                    dbRequest,
                    migrationFilesService
            );
            flyway = flywayService.configure();
            conf = flyway.getConfiguration();
            assertEquals("T", conf.getSqlMigrationPrefix());

        } finally {
            environmentVariables.clear("FLYWAY_CONFIG_FILE", "FLYWAY_SQL_MIGRATION_PREFIX");
        }
    }

    @Test(expected = com.amazonaws.services.s3.model.AmazonS3Exception.class)
    public void testConfigurationNotFound() throws IOException {
        try (MySQLContainer mysql = mySQLContainer()) {
            mysql.start();

            environmentVariables.set("FLYWAY_CONFIG_FILE", "s3://Bucket-1/flyway/config-not-there.props");
            String connectionString = mysql.getJdbcUrl();
            DBRequest dbRequest = new DBRequest().setUsername("user").setPassword("password").setConnectionString(connectionString);

            FlywayService flywayService = new FlywayService(
                    FlywayRequest.build(null),
                    dbRequest,
                    null
            );
            flywayService.configure();
        } finally {
            environmentVariables.clear("FLYWAY_CONFIG_FILE");
        }
    }
}
