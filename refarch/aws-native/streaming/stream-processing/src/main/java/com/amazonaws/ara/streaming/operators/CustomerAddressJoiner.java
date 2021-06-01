// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

package com.amazonaws.ara.streaming.operators;

import com.amazonaws.ara.streaming.dto.Address;
import com.amazonaws.ara.streaming.dto.Customer;
import org.apache.flink.annotation.VisibleForTesting;
import org.apache.flink.api.common.state.ValueState;
import org.apache.flink.api.common.state.ValueStateDescriptor;
import org.apache.flink.configuration.Configuration;
import org.apache.flink.streaming.api.functions.co.CoProcessFunction;
import org.apache.flink.util.Collector;

public class CustomerAddressJoiner extends CoProcessFunction<Customer, Address, Customer> {
    private static final long serialVersionUID = 1L;

    transient ValueState<Address> addressState;
    transient ValueState<Customer> customerState;

    @VisibleForTesting
    static Customer enrich(Customer customer, Address address) {
        customer.setAddress(address);
        return customer;
    }

    @Override
    public void open(Configuration config) {
        final ValueStateDescriptor<Address> addressesStateDescriptor = new ValueStateDescriptor<>("addressCAJ", Address.class);
        addressState = getRuntimeContext().getState(addressesStateDescriptor);

        final ValueStateDescriptor<Customer> customersStateDescriptor = new ValueStateDescriptor<>("customerCAJ", Customer.class);
        customerState = getRuntimeContext().getState(customersStateDescriptor);
    }

    @Override
    public void processElement1(Customer value, Context ctx, Collector<Customer> out) throws Exception {
        if (addressState.value() == null) {
            customerState.update(value);
        } else {
            final Address address = addressState.value();

            out.collect(enrich(value, address));

            addressState.clear(); // no need to keep the state active
        }
    }

    @Override
    public void processElement2(Address value, Context ctx, Collector<Customer> out) throws Exception {
        if (customerState.value() == null) {
            addressState.update(value);
        } else {
            final Customer customer = customerState.value();

            out.collect(enrich(customer, value));

            customerState.clear(); // no need to keep the state active
        }
    }
}
