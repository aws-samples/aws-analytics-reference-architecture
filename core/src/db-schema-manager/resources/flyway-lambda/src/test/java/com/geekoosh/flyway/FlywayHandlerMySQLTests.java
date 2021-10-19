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

import java.io.StringWriter;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;
import com.geekoosh.flyway.request.FlywayMethod;
import com.geekoosh.flyway.request.FlywayRequest;
import com.geekoosh.flyway.request.GitRequest;
import com.geekoosh.flyway.request.Request;
import com.geekoosh.flyway.response.Response;
import org.eclipse.jgit.junit.http.AppServer;
import org.eclipse.jgit.lib.ObjectId;
import org.flywaydb.core.api.MigrationInfo;
import org.junit.*;
import org.junit.contrib.java.lang.system.EnvironmentVariables;
import org.junit.runner.RunWith;
import org.mockito.junit.MockitoJUnitRunner;
import org.testcontainers.containers.MySQLContainer;

import java.util.Arrays;
import java.util.Collections;
import java.util.Properties;

@RunWith(MockitoJUnitRunner.class)
public class FlywayHandlerMySQLTests extends GitSSLTestCase {
    @Rule
    public final EnvironmentVariables environmentVariables
            = new EnvironmentVariables();

    private void setConnectionString(String connectionString) {
        environmentVariables.set("DB_CONNECTION_STRING", connectionString);
    }
    @Before
    public void setUp() throws Exception {
        super.setUp();
        environmentVariables.set("GIT_REPOSITORY", getRepoUrl());
        environmentVariables.set("GIT_USERNAME", AppServer.username);
        environmentVariables.set("GIT_PASSWORD", AppServer.password);
        environmentVariables.set("DB_USERNAME", "username");
        environmentVariables.set("DB_PASSWORD", "password");
        environmentVariables.set("FLYWAY_METHOD", FlywayMethod.MIGRATE.name());
    }

    private MySQLContainer mySQLContainer() {
        return new MySQLContainer<>().withUsername("username").withPassword("password").withDatabaseName("testdb");
    }

    @Test
    public void testMigrateMySQL() throws Exception {
        try (MySQLContainer mysql = mySQLContainer()) {
            mysql.start();
            setConnectionString(mysql.getJdbcUrl());

            pushFilesToMaster(
                    Arrays.asList(
                            new GitFile(
                                    getClass().getClassLoader().getResource("migrations/mysql/V1__init.sql"),
                                    "V1__init.sql"
                            ),
                            new GitFile(
                                    getClass().getClassLoader().getResource("migrations/mysql/V2__update.sql"),
                                    "V2__update.sql"
                            )
                    )
            );

            FlywayHandler flywayHandler = new FlywayHandler();
            Request request = new Request();
            Response response = flywayHandler.handleRequest(request, null);
            Assert.assertEquals("2", response.getInfo().getCurrent().getVersion().toString());
            Assert.assertEquals(2, response.getInfo().getApplied().length);

            Connection con = DriverManager.getConnection(mysql.getJdbcUrl(), "username", "password");
            Statement stmt = con.createStatement();
            ResultSet rs = stmt.executeQuery(String.format("describe %s.tasks;", "testdb"));
            rs.next();
            Assert.assertEquals(rs.getString(1), "task_id");
            Assert.assertEquals(rs.getString(2), "int(11)");

            rs = stmt.executeQuery(String.format("select * from %s.flyway_schema_history;", "testdb"));
            rs.next();
            Assert.assertEquals(rs.getInt(1), 1);
            Assert.assertEquals(rs.getInt(2), 1);

            con.close();

            request.setFlywayRequest(new FlywayRequest().setFlywayMethod(FlywayMethod.CLEAN));
            response = flywayHandler.handleRequest(request, null);
            Assert.assertNull(response.getInfo().getCurrent());
        }
    }

    @Test
    public void testMigrateWithConfig() throws Exception {
        try (MySQLContainer mysql = mySQLContainer()) {
            mysql.start();
            setConnectionString(mysql.getJdbcUrl());

            environmentVariables.set("FLYWAY_CONFIG_FILE", "file://flyway/config.props");

            Properties confProps = new Properties();
            confProps.setProperty("flyway.sqlMigrationPrefix", "P");
            StringWriter writer = new StringWriter();
            confProps.store(writer, "flyway");

            pushFilesToMaster(
                    Arrays.asList(
                            new GitFile(
                                    writer.toString(),
                                    "flyway/config.props"
                            ),
                            new GitFile(
                                    getClass().getClassLoader().getResource("migrations/mysql/V1__init.sql"),
                                    "P1__init.sql"
                            ),
                            new GitFile(
                                    getClass().getClassLoader().getResource("migrations/mysql/V2__update.sql"),
                                    "P2__update.sql"
                            )
                    )
            );
            FlywayHandler flywayHandler = new FlywayHandler();
            Request request = new Request();
            Response response = flywayHandler.handleRequest(request, null);
            MigrationInfo[] migrationInfos = response.getInfo().getApplied();
            Assert.assertEquals("2", response.getInfo().getCurrent().getVersion().toString());
            Assert.assertEquals(2, migrationInfos.length);
            Assert.assertEquals("P1__init.sql", migrationInfos[0].getScript());
            Assert.assertEquals("P2__update.sql", migrationInfos[1].getScript());
        } finally {
            environmentVariables.clear("FLYWAY_CONFIG_FILE");
        }
    }

    @Test
    public void testMigrateFromCommitMySQL() throws Exception {
        try (MySQLContainer mysql = mySQLContainer()) {
            mysql.start();
            setConnectionString(mysql.getJdbcUrl());
            ObjectId commitId1 = pushFilesToMaster(
                    Collections.singletonList(
                            new GitFile(
                                    getClass().getClassLoader().getResource("migrations/mysql/V1__init.sql"),
                                    "V1__init.sql"
                            )
                    )
            );
            ObjectId commitId2 = pushFilesToMaster(
                    Collections.singletonList(
                            new GitFile(
                                    getClass().getClassLoader().getResource("migrations/mysql/V2__update.sql"),
                                    "V2__update.sql"
                            )
                    )
            );

            FlywayHandler flywayHandler = new FlywayHandler();
            Request request = new Request().setGitRequest(new GitRequest().setCommit(commitId1.name()));
            Response response = flywayHandler.handleRequest(request, null);
            MigrationInfo[] migrationInfos = response.getInfo().getApplied();

            Assert.assertEquals("1", response.getInfo().getCurrent().getVersion().toString());
            Assert.assertEquals(1, migrationInfos.length);

            Assert.assertEquals("V1__init.sql", migrationInfos[0].getScript());

            request = new Request().setGitRequest(new GitRequest().setCommit(commitId2.name()));
            response = flywayHandler.handleRequest(request, null);
            migrationInfos = response.getInfo().getApplied();

            Assert.assertEquals("2", response.getInfo().getCurrent().getVersion().toString());
            Assert.assertEquals(2, migrationInfos.length);

            Assert.assertEquals("V1__init.sql", migrationInfos[0].getScript());
            Assert.assertEquals("V2__update.sql", migrationInfos[1].getScript());
        }
    }

    @Test
    public void testBaselineMySQL() throws Exception {
        try (MySQLContainer mysql = mySQLContainer()) {
            mysql.start();
            setConnectionString(mysql.getJdbcUrl());
            pushFilesToMaster(
                    Arrays.asList(
                            new GitFile(
                                    getClass().getClassLoader().getResource("migrations/mysql/V1__init.sql"),
                                    "V1__init.sql"
                            ),
                            new GitFile(
                                    getClass().getClassLoader().getResource("migrations/mysql/V2__update.sql"),
                                    "V2__update.sql"
                            )
                    )
            );
            FlywayHandler flywayHandler = new FlywayHandler();
            Request request = new Request().setFlywayRequest(
                    new FlywayRequest().setFlywayMethod(FlywayMethod.BASELINE).setBaselineVersion("1")
            );
            Response response = flywayHandler.handleRequest(request, null);
            Assert.assertEquals("1", response.getInfo().getCurrent().getVersion().toString());
            MigrationInfo[] migrationInfos = response.getInfo().getApplied();
            Assert.assertEquals("<< Flyway Baseline >>", migrationInfos[0].getScript());
            Assert.assertEquals(1, migrationInfos.length);

            flywayHandler = new FlywayHandler();
            request = new Request().setFlywayRequest(
                    new FlywayRequest().setFlywayMethod(FlywayMethod.MIGRATE)
            );
            response = flywayHandler.handleRequest(request, null);
            migrationInfos = response.getInfo().getApplied();
            Assert.assertEquals("2", response.getInfo().getCurrent().getVersion().toString());
            Assert.assertEquals(2, migrationInfos.length);
            Assert.assertEquals("<< Flyway Baseline >>", migrationInfos[0].getScript());
            Assert.assertEquals("V2__update.sql", migrationInfos[1].getScript());
        }
    }
}
