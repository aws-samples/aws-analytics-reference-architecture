// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

package com.amazonaws.ara.streaming;

import com.amazonaws.ara.http.AWSRequestSigningApacheInterceptor;
import com.amazonaws.ara.streaming.dto.Address;
import com.amazonaws.ara.streaming.dto.Customer;
import com.amazonaws.ara.streaming.dto.Item;
import com.amazonaws.ara.streaming.dto.Promo;
import com.amazonaws.ara.streaming.dto.Sale;
import com.amazonaws.ara.streaming.operators.ItemParser;
import com.amazonaws.ara.streaming.operators.PromoParser;
import com.amazonaws.ara.streaming.operators.SaleElasticsearchSinkFunction;
import com.amazonaws.ara.streaming.schemas.JsonDeserializationSchema;
import com.amazonaws.ara.streaming.utils.SaleBucketAssigner;
import com.amazonaws.services.kinesisanalytics.flink.connectors.producer.FlinkKinesisFirehoseProducer;
import com.amazonaws.services.kinesisanalytics.flink.connectors.serialization.JsonSerializationSchema;
import com.amazonaws.services.kinesisanalytics.runtime.KinesisAnalyticsRuntime;
import org.apache.flink.api.common.functions.FilterFunction;
import org.apache.flink.api.java.io.TextInputFormat;
import org.apache.flink.core.fs.Path;
import org.apache.flink.formats.parquet.avro.ParquetAvroWriters;
import org.apache.flink.streaming.api.datastream.DataStream;
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;
import org.apache.flink.streaming.api.functions.sink.SinkFunction;
import org.apache.flink.streaming.api.functions.sink.filesystem.StreamingFileSink;
import org.apache.flink.streaming.api.functions.source.FileProcessingMode;
import org.apache.flink.streaming.api.functions.source.SourceFunction;
import org.apache.flink.streaming.connectors.elasticsearch6.ElasticsearchSink;
import org.apache.http.HttpHost;
import org.apache.http.HttpRequestInterceptor;
import software.amazon.kinesis.connectors.flink.FlinkKinesisConsumer;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Properties;

public class StreamFactory {

    public static final String CONSUMER_CONFIG_PROPERTIES = "ConsumerConfigProperties";
    public static final String PRODUCER_CONFIG_PROPERTIES = "ProducerConfigProperties";

    private StreamFactory() {
        // Private ctor for utility class
    }

    public static SinkFunction<Sale> createSaleElasticsearchSink() throws IOException {
        Map<String, Properties> applicationProperties = KinesisAnalyticsRuntime.getApplicationProperties();
        Properties props = applicationProperties.get(PRODUCER_CONFIG_PROPERTIES);

        final List<HttpHost> httpHosts = Collections.singletonList(HttpHost.create(props.getProperty("ElasticsearchHost")));

        // use a ElasticsearchSink.Builder to create an ElasticsearchSink
        ElasticsearchSink.Builder<Sale> esSinkBuilder = new ElasticsearchSink.Builder<>(
                httpHosts,
                new SaleElasticsearchSinkFunction(props)
        );

        HttpRequestInterceptor interceptor = createAWSRequestSigningInterceptor(props.getProperty("Region"));

        esSinkBuilder.setRestClientFactory(
                restClientBuilder -> restClientBuilder.setHttpClientConfigCallback(
                        clientBuilder -> clientBuilder.addInterceptorLast(interceptor)
                )
        );

        return esSinkBuilder.build();
    }

    private static HttpRequestInterceptor createAWSRequestSigningInterceptor(String regionName) {

        return new AWSRequestSigningApacheInterceptor("es", regionName);
    }

    public static SourceFunction<Customer> createCustomerSource() throws IOException {
        Map<String, Properties> applicationProperties = KinesisAnalyticsRuntime.getApplicationProperties();
        Properties props = applicationProperties.get(CONSUMER_CONFIG_PROPERTIES);

        String streamName = props.getProperty("CustomerStream");

        return new FlinkKinesisConsumer<>(streamName, new JsonDeserializationSchema<>(Customer.class), props);
    }

    public static SourceFunction<Address> createAddressSource() throws IOException {
        Map<String, Properties> applicationProperties = KinesisAnalyticsRuntime.getApplicationProperties();
        Properties props = applicationProperties.get(CONSUMER_CONFIG_PROPERTIES);

        String streamName = props.getProperty("AddressStream");

        return new FlinkKinesisConsumer<>(streamName, new JsonDeserializationSchema<>(Address.class), props);
    }

    public static SourceFunction<Sale> createSaleSource() throws IOException {
        Map<String, Properties> applicationProperties = KinesisAnalyticsRuntime.getApplicationProperties();
        Properties props = applicationProperties.get(CONSUMER_CONFIG_PROPERTIES);

        String streamName = props.getProperty("SaleStream");

        return new FlinkKinesisConsumer<>(streamName, new JsonDeserializationSchema<>(Sale.class), props);
    }

    public static DataStream<Promo> createPromoStream(StreamExecutionEnvironment env) throws IOException {
        Map<String, Properties> applicationProperties = KinesisAnalyticsRuntime.getApplicationProperties();
        Properties props = applicationProperties.get(CONSUMER_CONFIG_PROPERTIES);
        String path = props.getProperty("PromoDataPath");

        final TextInputFormat inputFormat = new TextInputFormat(new Path(path));
        inputFormat.setNestedFileEnumeration(true);

        return env
                .readFile(inputFormat, path, FileProcessingMode.PROCESS_CONTINUOUSLY, 10_000)
                .name("Referential data (Promo)")
                .map(new PromoParser())
                .filter(new PromoFilter());
    }

    public static DataStream<Item> createItemStream(StreamExecutionEnvironment env) throws IOException {
        Map<String, Properties> applicationProperties = KinesisAnalyticsRuntime.getApplicationProperties();
        Properties props = applicationProperties.get(CONSUMER_CONFIG_PROPERTIES);
        String path = props.getProperty("ItemDataPath");

        final TextInputFormat inputFormat = new TextInputFormat(new Path(path));
        inputFormat.setNestedFileEnumeration(true);

        return env
                .readFile(inputFormat, path, FileProcessingMode.PROCESS_CONTINUOUSLY, 10_000)
                .name("Referential data (Item)")
                .map(new ItemParser())
                .filter(new ItemFilter());
    }

    public static SinkFunction<Sale> createSaleFirehoseSink() throws IOException {
        Map<String, Properties> applicationProperties = KinesisAnalyticsRuntime.getApplicationProperties();
        Properties props = applicationProperties.get(PRODUCER_CONFIG_PROPERTIES);

        final String deliveryStream = props.getProperty("DenormalizedSalesDeliveryStream");

        return new FlinkKinesisFirehoseProducer<>(deliveryStream, new JsonSerializationSchema<>(), props);
    }

    public static SinkFunction<Sale> createSaleS3Sink() throws IOException {
        Map<String, Properties> applicationProperties = KinesisAnalyticsRuntime.getApplicationProperties();
        Properties props = applicationProperties.get(PRODUCER_CONFIG_PROPERTIES);

        final String s3Path = props.getProperty("DenormalizedSalesS3Path");

        return StreamingFileSink
                .forBulkFormat(new Path(s3Path), ParquetAvroWriters.forReflectRecord(Sale.class))
                .withBucketAssigner(new SaleBucketAssigner("stream/"))
                .build();
    }

    private static class ItemFilter implements FilterFunction<Item> {

        @Override
        public boolean filter(Item value) throws Exception {
            return value != null;
        }
    }

    private static class PromoFilter implements FilterFunction<Promo> {

        @Override
        public boolean filter(Promo value) throws Exception {
            return value != null;
        }
    }
}
