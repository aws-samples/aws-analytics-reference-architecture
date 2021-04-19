// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

package com.amazonaws.ara.streaming;

import com.amazonaws.ara.streaming.dto.Address;
import com.amazonaws.ara.streaming.dto.Customer;
import com.amazonaws.ara.streaming.dto.Item;
import com.amazonaws.ara.streaming.dto.Promo;
import com.amazonaws.ara.streaming.dto.Sale;
import org.apache.flink.streaming.api.datastream.DataStream;
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;
import org.apache.flink.streaming.api.functions.sink.SinkFunction;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class StreamingJobIT {
    @BeforeEach
    void cleanCollector() {
        CollectSink.values.clear();
    }

    @Test
    void topologyShouldWork() throws Exception {
        // Given
        final StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();
        env.setParallelism(2);

        Address address = new Address();
        address.setAddressId("AAAAAA");
        address.setCity("Seattle");
        address.setCountry("United States");
        address.setState("WA");
        address.setStreet("410 Terry Ave. N");

        Customer customer = new Customer();
        customer.setCustomerId("AAAAAB");
        customer.setFirstName("John");
        customer.setLastName("Doe");
        customer.setAddressId(address.getAddressId());
        customer.setSalutation("Mr");

        Item item = new Item();
        item.setProductName("Echo Dot (3rd gen)");
        item.setColor("charcoal");
        item.setUnits("1");
        item.setItemId(1L);
        item.setManufact("Amazon");

        Promo promo = new Promo();
        promo.setPromoName("Fake promo");
        promo.setPromoId("AAAAAC");

        Sale sale = new Sale();
        sale.setBillCustomerId(customer.getCustomerId());
        sale.setShipCustomerId(customer.getCustomerId());
        sale.setItemId(item.getItemId());
        sale.setListPrice("49.99");
        sale.setPromoId(promo.getPromoId());

        DataStream<Customer> customerSource = env.fromElements(customer).name("customers");
        DataStream<Address> addressSource = env.fromElements(address).name("addresses");
        DataStream<Sale> saleSource = env.fromElements(sale).name("sales");
        DataStream<Item> itemSource = env.fromElements(item).name("item");
        DataStream<Promo> promoSource = env.fromElements(promo).name("promos");

        final DataStream<Sale> stream = StreamingJob.processingWorkflow(customerSource, addressSource, saleSource, itemSource, promoSource);

        final CollectSink sink = new CollectSink();

        stream.addSink(sink).name("Fake sink");

        // When
        env.execute("KDA test");

        // Then
        assertEquals(1, CollectSink.values.size());

        Sale result = CollectSink.values.get(0);

        assertEquals(customer.getCustomerId(), result.getBillCustomerId());
    }

    @Test
    void topologyShouldWorkWithUnlinkedEntities() throws Exception {
        // Given
        final StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();
        env.setParallelism(2);

        Address address1 = new Address();
        address1.setAddressId("AAAAAA");
        address1.setCity("Seattle");
        address1.setCountry("United States");
        address1.setState("WA");
        address1.setStreet("410 Terry Ave. N");

        Address address2 = new Address();
        address2.setAddressId("BBBBBB");
        address2.setCity("Seattle");
        address2.setCountry("United States");
        address2.setState("WA");
        address2.setStreet("410 Terry Ave. N");

        Customer customer1 = new Customer();
        customer1.setCustomerId("AAAAAB");
        customer1.setFirstName("John");
        customer1.setLastName("Doe");
        customer1.setAddressId(address1.getAddressId());
        customer1.setSalutation("Mr");

        Customer customer2 = new Customer();
        customer2.setCustomerId("BBBBBC");
        customer2.setFirstName("John");
        customer2.setLastName("Doe");
        customer2.setAddressId("ZZZZZZZ"); // an ID that is not present in the stream
        customer2.setSalutation("Mr");

        Item item1 = new Item();
        item1.setProductName("Echo Dot (3rd gen)");
        item1.setColor("charcoal");
        item1.setUnits("1");
        item1.setItemId(1L);
        item1.setManufact("Amazon");

        Item item2 = new Item();
        item2.setProductName("Echo Dot (3rd gen)");
        item2.setColor("purple");
        item2.setUnits("1");
        item2.setItemId(2L);
        item2.setManufact("Amazon");

        Promo promo1 = new Promo();
        promo1.setPromoName("Fake promo");
        promo1.setPromoId("AAAAAC");

        Promo promo2 = new Promo();
        promo2.setPromoName("Fake promo 2");
        promo2.setPromoId("BBBBBD");

        Sale sale1 = new Sale();
        sale1.setBillCustomerId(customer1.getCustomerId());
        sale1.setShipCustomerId(customer1.getCustomerId());
        sale1.setItemId(item1.getItemId());
        sale1.setListPrice("49.99");
        sale1.setPromoId(promo1.getPromoId());

        Sale sale2 = new Sale();
        sale2.setBillCustomerId("KKKKKK"); // A customer that is not in the stream
        sale2.setShipCustomerId("KKKKKK");
        sale2.setItemId(item2.getItemId());
        sale2.setListPrice("49.99");
        sale2.setPromoId("ABCDEF"); // A promo that is not present in the stream

        DataStream<Customer> customerSource = env.fromElements(customer1, customer2).name("customers");
        DataStream<Address> addressSource = env.fromElements(address1, address2).name("addresses");
        DataStream<Sale> saleSource = env.fromElements(sale1, sale2).name("sales");
        DataStream<Item> itemSource = env.fromElements(item1, item2).name("item");
        DataStream<Promo> promoSource = env.fromElements(promo1, promo2).name("promos");

        final DataStream<Sale> stream = StreamingJob.processingWorkflow(customerSource, addressSource, saleSource, itemSource, promoSource);

        final CollectSink sink = new CollectSink();

        stream.addSink(sink).name("Fake sink");

        // When
        env.execute("KDA test");

        // Then
        assertEquals(1, CollectSink.values.size());

        Sale result = CollectSink.values.get(0);

        assertEquals(customer1.getCustomerId(), result.getBillCustomerId());
    }

    private static class CollectSink implements SinkFunction<Sale> {
        public static final List<Sale> values = new ArrayList<>();
        private static final long serialVersionUID = 1L;

        @Override
        public void invoke(Sale value, Context context) throws Exception {
            values.add(value);
        }
    }
}
