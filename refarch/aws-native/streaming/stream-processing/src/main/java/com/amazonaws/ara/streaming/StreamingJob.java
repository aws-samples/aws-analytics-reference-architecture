// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

package com.amazonaws.ara.streaming;

import com.amazonaws.ara.streaming.dto.Address;
import com.amazonaws.ara.streaming.dto.Customer;
import com.amazonaws.ara.streaming.dto.Item;
import com.amazonaws.ara.streaming.dto.Promo;
import com.amazonaws.ara.streaming.dto.Sale;
import com.amazonaws.ara.streaming.operators.CustomerAddressJoiner;
import com.amazonaws.ara.streaming.operators.CustomerBirthdateCleaner;
import com.amazonaws.ara.streaming.operators.SaleBillCustomerJoiner;
import com.amazonaws.ara.streaming.operators.SaleItemJoiner;
import com.amazonaws.ara.streaming.operators.SalePromoJoiner;
import com.amazonaws.ara.streaming.operators.SaleShipCustomerJoiner;
import org.apache.flink.annotation.VisibleForTesting;
import org.apache.flink.api.java.tuple.Tuple;
import org.apache.flink.streaming.api.datastream.DataStream;
import org.apache.flink.streaming.api.datastream.KeyedStream;
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;
import org.apache.flink.streaming.api.functions.sink.SinkFunction;
import org.apache.flink.streaming.api.functions.source.SourceFunction;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class StreamingJob {
    private static final Logger log = LoggerFactory.getLogger(StreamingJob.class);

    public static void main(String[] args) throws Exception {

        log.info("Starting application");

        // set up the streaming execution environment
        final StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();

        // Sources
        final SourceFunction<Customer> customerSource = StreamFactory.createCustomerSource();
        final SourceFunction<Address> addressSource = StreamFactory.createAddressSource();
        final SourceFunction<Sale> saleSource = StreamFactory.createSaleSource();

        final DataStream<Customer> customerStream = env.addSource(customerSource, "Kinesis [Customers]");
        final DataStream<Address> addressStream = env.addSource(addressSource, "Kinesis [Addresses]");
        final DataStream<Sale> saleStream = env.addSource(saleSource, "Kinesis [Sales]");

        final DataStream<Item> itemStream = StreamFactory.createItemStream(env);
        final DataStream<Promo> promoStream = StreamFactory.createPromoStream(env);

        // Our workflow
        final DataStream<Sale> salesWithPromo = processingWorkflow(customerStream,
                addressStream,
                saleStream,
                itemStream,
                promoStream);

        // Various sinks
        final SinkFunction<Sale> elasticsearchSink = StreamFactory.createSaleElasticsearchSink();

        salesWithPromo.addSink(elasticsearchSink).name("Elasticsearch Sink");

        final SinkFunction<Sale> saleS3Sink = StreamFactory.createSaleS3Sink();
        salesWithPromo.addSink(saleS3Sink).name("S3 Sink");

        // Execute job
        env.execute("KDA Kinesis to ES");
    }

    @VisibleForTesting
    static DataStream<Sale> processingWorkflow(DataStream<Customer> customerDataStream, DataStream<Address> addressDataStream, DataStream<Sale> saleDataStream, DataStream<Item> itemDataStream, DataStream<Promo> promoDataStream) {
//        final KeyedStream<Address, Tuple> addressesWithGeoLoc = AsyncDataStream
//                .unorderedWait(addressDataStream, new AsyncGeocoderRequest(), 1000L, TimeUnit.MILLISECONDS, 100)
//                .name("Enrich address with geolocation")
//                .keyBy("addressId");

        final KeyedStream<Address, Tuple> addressesWithGeoLoc = addressDataStream.keyBy("addressId");

        final KeyedStream<Customer, Tuple> customersWithAddresses = customerDataStream
                .process(new CustomerBirthdateCleaner())
                .keyBy("addressId")
                .connect(addressesWithGeoLoc)
                .process(new CustomerAddressJoiner())
                .name("Enrich customer with address")
                .keyBy("customerId");

        final DataStream<Sale> saleWithBilling = saleDataStream
                .keyBy("billCustomerId")
                .connect(customersWithAddresses)
                .process(new SaleBillCustomerJoiner())
                .name("Enrich with billing");

        final DataStream<Sale> saleWithShipping = saleWithBilling
                .keyBy("shipCustomerId")
                .connect(customersWithAddresses)
                .process(new SaleShipCustomerJoiner())
                .name("Enrich with shipping");

        final DataStream<Sale> saleWithItem = saleWithShipping
                .keyBy("itemId")
                .connect(itemDataStream.keyBy("itemId"))
                .process(new SaleItemJoiner())
                .name("Enrich with item");

        return saleWithItem.keyBy("promoId")
                .connect(promoDataStream.keyBy("promoId"))
                .process(new SalePromoJoiner())
                .name("Enrich with promo");
    }
}
