// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

package com.amazonaws.ara.streaming;

import com.amazonaws.ara.streaming.dto.Address;
import com.amazonaws.ara.streaming.dto.Customer;
import com.amazonaws.ara.streaming.dto.Item;
import com.amazonaws.ara.streaming.dto.Promo;
import com.amazonaws.ara.streaming.dto.Sale;
import com.amazonaws.services.kinesisanalytics.runtime.KinesisAnalyticsRuntime;
import com.amazonaws.services.kinesisanalytics.runtime.models.PropertyGroup;
import org.apache.flink.shaded.jackson2.com.fasterxml.jackson.databind.JsonNode;
import org.apache.flink.shaded.jackson2.com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.flink.streaming.api.datastream.DataStream;
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;
import org.apache.flink.streaming.api.functions.sink.PrintSinkFunction;
import org.apache.flink.streaming.api.functions.sink.SinkFunction;
import org.apache.flink.streaming.api.functions.source.SourceFunction;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;
import org.mockito.Mockito;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

import static org.junit.jupiter.api.Assertions.assertNotNull;

class StreamFactoryTest {

    // Adapted from KinesisAnalyticsRuntime#getApplicationProperties(String)
    private static Map<String, Properties> getApplicationProperties(InputStream stream) throws IOException {
        Map<String, Properties> appProperties = new HashMap<>();
        ObjectMapper mapper = new ObjectMapper();

        try {
            JsonNode root = mapper.readTree(stream);
            for (final JsonNode elem : root) {
                PropertyGroup propertyGroup = mapper.treeToValue(elem, PropertyGroup.class);
                Properties properties = new Properties();

                properties.putAll(propertyGroup.properties);
                appProperties.put(propertyGroup.groupID, properties);
            }
        } catch (FileNotFoundException ignored) {
            // swallow file not found and return empty runtime properties
        }
        return appProperties;
    }

    @Test
    void shouldCreateCustomerSource() throws IOException {
        try (MockedStatic<KinesisAnalyticsRuntime> mocked = Mockito.mockStatic(KinesisAnalyticsRuntime.class);
             InputStream configPropertiesStream = StreamFactoryTest.class.getClassLoader().getResourceAsStream("application_properties.json")
        ) {
            // Given
            Map<String, Properties> props = getApplicationProperties(configPropertiesStream);
            mocked.when(KinesisAnalyticsRuntime::getApplicationProperties).thenReturn(props);

            // When
            final SourceFunction<Customer> customerSource = StreamFactory.createCustomerSource();

            // Then
            assertNotNull(customerSource);
        }
    }

    @Test
    void shouldCreateAddressSource() throws IOException {
        try (MockedStatic<KinesisAnalyticsRuntime> mocked = Mockito.mockStatic(KinesisAnalyticsRuntime.class);
             InputStream configPropertiesStream = StreamFactoryTest.class.getClassLoader().getResourceAsStream("application_properties.json")
        ) {
            // Given
            Map<String, Properties> props = getApplicationProperties(configPropertiesStream);
            mocked.when(KinesisAnalyticsRuntime::getApplicationProperties).thenReturn(props);

            // When
            final SourceFunction<Address> customerSource = StreamFactory.createAddressSource();

            // Then
            assertNotNull(customerSource);
        }
    }

    @Test
    void shouldCreateSaleSource() throws IOException {
        try (MockedStatic<KinesisAnalyticsRuntime> mocked = Mockito.mockStatic(KinesisAnalyticsRuntime.class);
             InputStream configPropertiesStream = StreamFactoryTest.class.getClassLoader().getResourceAsStream("application_properties.json")
        ) {
            // Given
            Map<String, Properties> props = getApplicationProperties(configPropertiesStream);
            mocked.when(KinesisAnalyticsRuntime::getApplicationProperties).thenReturn(props);

            // When
            final SourceFunction<Sale> customerSource = StreamFactory.createSaleSource();

            // Then
            assertNotNull(customerSource);
        }
    }

    @Test
    void shouldCreateElasticsearchSink() throws IOException {
        try (MockedStatic<KinesisAnalyticsRuntime> mocked = Mockito.mockStatic(KinesisAnalyticsRuntime.class);
             InputStream configPropertiesStream = StreamFactoryTest.class.getClassLoader().getResourceAsStream("application_properties.json")
        ) {
            // Given
            Map<String, Properties> props = getApplicationProperties(configPropertiesStream);
            mocked.when(KinesisAnalyticsRuntime::getApplicationProperties).thenReturn(props);
            // When
            final SinkFunction<Sale> sink = StreamFactory.createSaleElasticsearchSink();

            // Then
            assertNotNull(sink);
        }
    }

    @Test
    void shouldCreateFirehoseSink() throws IOException {
        try (MockedStatic<KinesisAnalyticsRuntime> mocked = Mockito.mockStatic(KinesisAnalyticsRuntime.class);
             InputStream configPropertiesStream = StreamFactoryTest.class.getClassLoader().getResourceAsStream("application_properties.json")
        ) {
            // Given
            Map<String, Properties> props = getApplicationProperties(configPropertiesStream);
            mocked.when(KinesisAnalyticsRuntime::getApplicationProperties).thenReturn(props);
            // When
            final SinkFunction<Sale> sink = StreamFactory.createSaleFirehoseSink();

            // Then
            assertNotNull(sink);
        }
    }

    @Test
    void shouldCreateS3Sink() throws IOException {
        try (MockedStatic<KinesisAnalyticsRuntime> mocked = Mockito.mockStatic(KinesisAnalyticsRuntime.class);
             InputStream configPropertiesStream = StreamFactoryTest.class.getClassLoader().getResourceAsStream("application_properties.json")
        ) {
            // Given
            Map<String, Properties> props = getApplicationProperties(configPropertiesStream);
            mocked.when(KinesisAnalyticsRuntime::getApplicationProperties).thenReturn(props);
            // When
            final SinkFunction<Sale> sink = StreamFactory.createSaleS3Sink();

            // Then
            assertNotNull(sink);
        }
    }

    @Disabled
    @Test
    void shouldProcessItemsFromDisk() throws Exception {
        try (MockedStatic<KinesisAnalyticsRuntime> mocked = Mockito.mockStatic(KinesisAnalyticsRuntime.class);
             InputStream configPropertiesStream = StreamFactoryTest.class.getClassLoader().getResourceAsStream("application_properties.json")
        ) {
            // Given
            Map<String, Properties> props = getApplicationProperties(configPropertiesStream);
            mocked.when(KinesisAnalyticsRuntime::getApplicationProperties).thenReturn(props);

            // When
            final StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();
            env.setParallelism(2);

            final DataStream<Item> itemStream = StreamFactory.createItemStream(env);

            itemStream.addSink(new PrintSinkFunction<>());
            env.execute("KDA test");

            // Then
        }
    }

    @Disabled
    @Test
    void shouldProcessPromosFromDisk() throws Exception {
        try (MockedStatic<KinesisAnalyticsRuntime> mocked = Mockito.mockStatic(KinesisAnalyticsRuntime.class);
             InputStream configPropertiesStream = StreamFactoryTest.class.getClassLoader().getResourceAsStream("application_properties.json")
        ) {
            // Given
            Map<String, Properties> props = getApplicationProperties(configPropertiesStream);
            mocked.when(KinesisAnalyticsRuntime::getApplicationProperties).thenReturn(props);

            // When
            final StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();
            env.setParallelism(2);

            final DataStream<Promo> promoStream = StreamFactory.createPromoStream(env);

            promoStream.addSink(new PrintSinkFunction<>());
            env.execute("KDA test");

            // Then
        }
    }
}
