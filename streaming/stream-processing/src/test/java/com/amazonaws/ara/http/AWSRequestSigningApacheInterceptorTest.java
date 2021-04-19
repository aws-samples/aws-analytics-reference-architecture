// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

package com.amazonaws.ara.http;

import org.apache.http.HttpEntityEnclosingRequest;
import org.apache.http.HttpHost;
import org.apache.http.HttpRequest;
import org.apache.http.entity.StringEntity;
import org.apache.http.message.BasicHttpEntityEnclosingRequest;
import org.apache.http.message.BasicHttpRequest;
import org.apache.http.protocol.BasicHttpContext;
import org.apache.http.protocol.HttpCoreContext;
import org.junit.jupiter.api.Test;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

class AWSRequestSigningApacheInterceptorTest {

    private static AWSRequestSigningApacheInterceptor createInterceptor() {
        return new AWSRequestSigningApacheInterceptor("servicename", "us-east-1");
    }

    @Test
    void testSimpleSigner() throws Exception {
        HttpEntityEnclosingRequest request =
                new BasicHttpEntityEnclosingRequest("GET", "/query?a=b");
        request.setEntity(new StringEntity("I'm an entity"));
        request.addHeader("foo", "bar");
        request.addHeader("content-length", "0");

        HttpCoreContext context = new HttpCoreContext();
        context.setTargetHost(HttpHost.create("localhost"));

        createInterceptor().process(request, context);

        assertEquals("bar", request.getFirstHeader("foo").getValue());
        assertNotNull(request.getFirstHeader("Authorization"));
        assertNull(request.getFirstHeader("content-length"));
    }

    @Test
    void testBadRequest() throws Exception {

        HttpRequest badRequest = new BasicHttpRequest("GET", "?#!@*%");
        assertThrows(IOException.class, () -> createInterceptor().process(badRequest, new BasicHttpContext()));
    }

    @Test
    void testEncodedUriSigner() throws Exception {
        HttpEntityEnclosingRequest request =
                new BasicHttpEntityEnclosingRequest("GET", "/foo-2017-02-25%2Cfoo-2017-02-26/_search?a=b");
        request.setEntity(new StringEntity("I'm an entity"));
        request.addHeader("foo", "bar");
        request.addHeader("content-length", "0");

        HttpCoreContext context = new HttpCoreContext();
        context.setTargetHost(HttpHost.create("localhost"));

        createInterceptor().process(request, context);

        assertEquals("bar", request.getFirstHeader("foo").getValue());
        assertNotNull(request.getFirstHeader("Authorization"));
        assertNull(request.getFirstHeader("content-length"));
    }
}
