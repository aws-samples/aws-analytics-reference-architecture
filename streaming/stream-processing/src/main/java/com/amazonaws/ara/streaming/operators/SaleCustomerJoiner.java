// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

package com.amazonaws.ara.streaming.operators;

import com.amazonaws.ara.streaming.dto.Customer;
import com.amazonaws.ara.streaming.dto.Sale;
import org.apache.flink.api.common.state.ListState;
import org.apache.flink.api.common.state.ValueState;
import org.apache.flink.streaming.api.functions.co.CoProcessFunction;
import org.apache.flink.util.Collector;

public abstract class SaleCustomerJoiner extends CoProcessFunction<Sale, Customer, Sale> {
    abstract Sale enrich(Sale sale, Customer customer);

    abstract ValueState<Customer> getCustomerState();

    abstract ListState<Sale> getSalesState();

    @Override
    public void processElement1(Sale value, Context ctx, Collector<Sale> out) throws Exception {
        if (getCustomerState().value() == null) {
            getSalesState().add(value);
        } else {
            final Customer customer = getCustomerState().value();
            out.collect(enrich(value, customer));
        }
    }

    @Override
    public void processElement2(Customer value, Context ctx, Collector<Sale> out) throws Exception {
        getCustomerState().update(value); // Update the state. This state will persist for subsequent sales.

        for (final Sale sale : getSalesState().get()) {
            out.collect(enrich(sale, value));
        }

        getSalesState().clear(); // Clear the list of sales to be processed
    }
}
