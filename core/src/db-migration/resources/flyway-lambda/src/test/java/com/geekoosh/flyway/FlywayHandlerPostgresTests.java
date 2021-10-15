/*
 * Copyright (C) 2017 Thomas Wolf <thomas.wolf@paranor.ch>
 * and other copyright owners as documented in the project's IP log.
 *
 * This program and the accompanying materials are made available
 * under the terms of the Eclipse Distribution License v1.0 which
 * accompanies this distribution, is reproduced below, and is
 * available at http://www.eclipse.org/org/documents/edl-v10.php
 *
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or
 * without modification, are permitted provided that the following
 * conditions are met:
 *
 * - Redistributions of source code must retain the above copyright
 *   notice, this list of conditions and the following disclaimer.
 *
 * - Redistributions in binary form must reproduce the above
 *   copyright notice, this list of conditions and the following
 *   disclaimer in the documentation and/or other materials provided
 *   with the distribution.
 *
 * - Neither the name of the Eclipse Foundation, Inc. nor the
 *   names of its contributors may be used to endorse or promote
 *   products derived from this software without specific prior
 *   written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND
 * CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES,
 * INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 * NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
 * STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
 * ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

package com.geekoosh.flyway;

import com.adobe.testing.s3mock.S3MockRule;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.secretsmanager.AWSSecretsManager;
import com.amazonaws.services.secretsmanager.model.GetSecretValueRequest;
import com.amazonaws.services.secretsmanager.model.GetSecretValueResult;
import com.geekoosh.flyway.request.FlywayMethod;
import com.geekoosh.flyway.request.Request;
import com.geekoosh.flyway.request.ValueManager;
import com.geekoosh.flyway.response.Response;
import com.geekoosh.lambda.s3.S3Service;
import org.json.JSONObject;
import org.junit.*;
import org.junit.contrib.java.lang.system.EnvironmentVariables;
import org.junit.runner.RunWith;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.testcontainers.containers.PostgreSQLContainer;

import java.io.File;
import java.sql.*;

@RunWith(MockitoJUnitRunner.class)
public class FlywayHandlerPostgresTests {

    @ClassRule
    public static S3MockRule S3_MOCK_RULE = new S3MockRule();
    private final AmazonS3 s3 = S3_MOCK_RULE.createS3Client();
    private final S3MockHelper s3MockHelper = new S3MockHelper(s3);

    @Rule
    public final EnvironmentVariables environmentVariables
            = new EnvironmentVariables();

    @Before
    public void setUp() throws Exception {
        S3Service.setAmazonS3(s3);
    }

    private void testMigrate(String connectionString, String bucket) throws SQLException {
        testMigrate(connectionString, bucket, null, "password", false);
    }
    private void testMigrate(String connectionString, String bucket, String s3Folder) throws SQLException {
        testMigrate(connectionString, bucket, s3Folder, "password", false);
    }

    private void testMigrate(String connectionString, String bucket, String s3Folder, String password, boolean isSecret) throws SQLException {
        try {
            environmentVariables.set("AWS_REGION", "us-east-1");
            environmentVariables.set("S3_BUCKET", bucket);
            if (s3Folder != null) {
                environmentVariables.set("S3_FOLDER", "migrations");
            }
            environmentVariables.set("DB_USERNAME", "username");
            environmentVariables.set(isSecret ? "DB_SECRET" : "DB_PASSWORD", password);
            environmentVariables.set("DB_CONNECTION_STRING", connectionString);
            environmentVariables.set("FLYWAY_METHOD", FlywayMethod.MIGRATE.name());

            FlywayHandler flywayHandler = new FlywayHandler();
            Response response = flywayHandler.handleRequest(new Request(), null);
            Assert.assertEquals("1", response.getInfo().getCurrent().getVersion().toString());
            Assert.assertEquals(1, response.getInfo().getApplied().length);

            Connection con = DriverManager.getConnection(connectionString, "username", "password");
            Statement stmt = con.createStatement();
            ResultSet rs = stmt.executeQuery("SELECT column_name, data_type FROM information_schema.COLUMNS WHERE TABLE_NAME='tasks';");
            rs.next();
            Assert.assertEquals(rs.getString(1), "task_id");
            Assert.assertEquals(rs.getString(2), "integer");

            rs = stmt.executeQuery("SELECT * FROM flyway_schema_history;");
            rs.next();
            Assert.assertEquals(rs.getInt(1), 1);
            Assert.assertEquals(rs.getInt(2), 1);

            con.close();
        } finally {
            environmentVariables.clear("AWS_REGION", "S3_BUCKET", "S3_FOLDER", "DB_USERNAME", "DB_PASSWORD", "DB_CONNECTION_STRING", "FLYWAY_METHOD");
        }
    }

    private PostgreSQLContainer postgreSQLContainer() {
        return new PostgreSQLContainer<>().withUsername("username").withPassword("password");
    }

    @Test
    public void testMigratePostgresWithS3Folder() throws SQLException {
        try (PostgreSQLContainer postgres = postgreSQLContainer()) {
            postgres.start();
            s3MockHelper.upload(
                    new File(getClass().getClassLoader().getResource("migrations/postgres/V1__init.sql").getFile()),
                    "Bucket-1",
                    "migrations/V1__init.sql"
            );
            testMigrate(postgres.getJdbcUrl(), "Bucket-1", "migrations");
        }
    }
    @Test
    public void testMigratePostgres() throws SQLException {
        try (PostgreSQLContainer postgres = postgreSQLContainer()) {
            postgres.start();
            s3MockHelper.upload(
                    new File(getClass().getClassLoader().getResource("migrations/postgres/V1__init.sql").getFile()),
                    "Bucket-2",
                    "V1__init.sql"
            );
            testMigrate(postgres.getJdbcUrl(), "Bucket-2");
        }
    }
    @Test
    public void testPasswordSecret() throws SQLException {
        try (PostgreSQLContainer postgres = postgreSQLContainer()) {
            postgres.start();
            AWSSecretsManager awsSecretsManager = Mockito.mock(AWSSecretsManager.class);
            ValueManager.setClient(awsSecretsManager);

            GetSecretValueResult getSecretValueResult = new GetSecretValueResult();
            getSecretValueResult.setSecretString(new JSONObject().put("password", "password").put("username", "username").toString());
            Mockito.when(awsSecretsManager.getSecretValue(
                    Mockito.eq(new GetSecretValueRequest().withSecretId("password_secret").withVersionStage("AWSCURRENT"))))
                    .thenReturn(getSecretValueResult);
            s3MockHelper.upload(
                    new File(getClass().getClassLoader().getResource("migrations/postgres/V1__init.sql").getFile()),
                    "Bucket-3",
                    "migrations/V1__init.sql"
            );
            testMigrate(postgres.getJdbcUrl(), "Bucket-3", "migrations", "password_secret", true);
        }
    }
}

