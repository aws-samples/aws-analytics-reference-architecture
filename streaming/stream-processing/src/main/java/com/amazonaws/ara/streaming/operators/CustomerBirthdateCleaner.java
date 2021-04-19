// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

package com.amazonaws.ara.streaming.operators;

import com.amazonaws.ara.streaming.dto.Customer;
import org.apache.flink.streaming.api.functions.ProcessFunction;
import org.apache.flink.util.Collector;

public class CustomerBirthdateCleaner extends ProcessFunction<Customer, Customer> {
    @Override
    public void processElement(Customer customer, Context ctx, Collector<Customer> out) throws Exception {
        if (customer.getBirthDate() == null || customer.getBirthDate().isEmpty()) {
            customer.setBirthDate("1970-01-01T00:00:00.000000Z");
        }
        out.collect(customer);
    }
}
