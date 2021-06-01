// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

package com.amazonaws.ara.http;

import com.amazonaws.DefaultRequest;
import com.amazonaws.auth.AWS4Signer;
import com.amazonaws.auth.AWSCredentialsProvider;
import com.amazonaws.auth.DefaultAWSCredentialsProviderChain;
import com.amazonaws.http.HttpMethodName;
import org.apache.http.Header;
import org.apache.http.HttpEntityEnclosingRequest;
import org.apache.http.HttpException;
import org.apache.http.HttpHost;
import org.apache.http.HttpRequest;
import org.apache.http.HttpRequestInterceptor;
import org.apache.http.NameValuePair;
import org.apache.http.client.utils.URIBuilder;
import org.apache.http.entity.BasicHttpEntity;
import org.apache.http.message.BasicHeader;
import org.apache.http.protocol.HttpContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.io.Serializable;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

import static org.apache.http.protocol.HttpCoreContext.HTTP_TARGET_HOST;

/**
 * Interceptor for AWS services REST API calls.
 * Adapted from https://github.com/awslabs/aws-request-signing-apache-interceptor
 */
public class AWSRequestSigningApacheInterceptor implements HttpRequestInterceptor, Serializable {
    private static final Logger log = LoggerFactory.getLogger(AWSRequestSigningApacheInterceptor.class);

    private static final long serialVersionUID = 2L;

    private final String service;
    private final String region;

    public AWSRequestSigningApacheInterceptor(final String service, final String region) {
        this.service = service;
        this.region = region;
    }

    @Override
    public void process(HttpRequest httpRequest, HttpContext httpContext) throws HttpException, IOException {
        URIBuilder uriBuilder;

        try {
            uriBuilder = new URIBuilder(httpRequest.getRequestLine().getUri());
        } catch (URISyntaxException e) {
            throw new IOException("Invalid URI", e);
        }

        // 1. Create a SignableRequest from the HttpRequest so that we can sign it
        DefaultRequest<Object> signableRequest = new DefaultRequest<>(service);

        HttpHost host = (HttpHost) httpContext.getAttribute(HTTP_TARGET_HOST);
        if (host != null) {
            signableRequest.setEndpoint(URI.create(host.toURI()));
        }

        final HttpMethodName httpMethod = HttpMethodName.fromValue(httpRequest.getRequestLine().getMethod());

        signableRequest.setHttpMethod(httpMethod);

        try {
            signableRequest.setResourcePath(uriBuilder.build().getRawPath());
        } catch (URISyntaxException e) {
            throw new IOException("Invalid URI", e);
        }

        if (httpRequest instanceof HttpEntityEnclosingRequest) {
            final HttpEntityEnclosingRequest httpEntityEnclosingRequest = (HttpEntityEnclosingRequest) httpRequest;
            if (httpEntityEnclosingRequest.getEntity() != null) {
                signableRequest.setContent(httpEntityEnclosingRequest.getEntity().getContent());
            }
        }

        signableRequest.setParameters(nvpToMapParams(uriBuilder.getQueryParams()));
        signableRequest.setHeaders(headerArrayToMap(httpRequest.getAllHeaders()));

        // 2. Sign the SignableRequest
        final AWSCredentialsProvider credentialsProvider = new DefaultAWSCredentialsProviderChain();
        final AWS4Signer signer = new AWS4Signer();
        signer.setRegionName(region);
        signer.setServiceName(service);
        signer.sign(signableRequest, credentialsProvider.getCredentials());

        // 3. Copy everything back to the HttpRequest
        httpRequest.setHeaders(mapToHeaderArray(signableRequest.getHeaders()));

        if (httpRequest instanceof HttpEntityEnclosingRequest) {
            final HttpEntityEnclosingRequest httpEntityEnclosingRequest = (HttpEntityEnclosingRequest) httpRequest;

            if (httpEntityEnclosingRequest.getEntity() != null) {
                final BasicHttpEntity basicHttpEntity = new BasicHttpEntity();
                basicHttpEntity.setContent(signableRequest.getContent());
                httpEntityEnclosingRequest.setEntity(basicHttpEntity);
            }
        }
    }

    /**
     * Convert a map to an array of Header
     *
     * @param mapHeaders A set of headers given as a map
     * @return an Array of Header
     */
    private Header[] mapToHeaderArray(final Map<String, String> mapHeaders) {
        Header[] headers = new Header[mapHeaders.size()];
        int i = 0;
        for (final Map.Entry<String, String> headerEntry : mapHeaders.entrySet()) {
            headers[i++] = new BasicHeader(headerEntry.getKey(), headerEntry.getValue());
        }

        return headers;
    }

    /**
     * Convert an array for Header to a map
     *
     * @param allHeaders an array of headers
     * @return A map of Strings.
     */
    private Map<String, String> headerArrayToMap(final Header[] allHeaders) {
        final Map<String, String> headersMap = new TreeMap<>(String.CASE_INSENSITIVE_ORDER);

        for (final Header header : allHeaders) {
            log.debug("Processing header {} {}", header.getName(), header.getValue());
            if (!skipHeader(header)) {
                headersMap.put(header.getName(), header.getValue());
            }
        }

        return headersMap;
    }

    /**
     * Determine headers that must be skipped for signing process.
     *
     * @param header A header to test
     * @return true if the header must be skipped
     */
    private boolean skipHeader(Header header) {
        if ("content-length".equalsIgnoreCase(header.getName()) && "0".equals(header.getValue())) return true;

        return "host".equalsIgnoreCase(header.getName());
    }

    /**
     * NameValuePair to params
     *
     * @param queryParams A list of (Name, Value) pairs.
     * @return A map of the parameters
     */
    private Map<String, List<String>> nvpToMapParams(final List<NameValuePair> queryParams) {
        final TreeMap<String, List<String>> parametersMap = new TreeMap<>(String.CASE_INSENSITIVE_ORDER);
        for (final NameValuePair nvp : queryParams) {
            log.debug("Processing param {} {}", nvp.getName(), nvp.getValue());
            final List<String> argsList = parametersMap.computeIfAbsent(nvp.getName(), k -> new ArrayList<>());
            argsList.add(nvp.getValue());
        }
        return parametersMap;
    }
}
