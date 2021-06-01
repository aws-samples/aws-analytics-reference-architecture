// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

package com.amazonaws.ara.streaming.operators;

import com.amazonaws.ara.streaming.dto.Customer;
import com.amazonaws.ara.streaming.dto.Sale;
import org.apache.flink.api.common.state.ListState;
import org.apache.flink.api.common.state.ListStateDescriptor;
import org.apache.flink.api.common.state.ValueState;
import org.apache.flink.api.common.state.ValueStateDescriptor;
import org.apache.flink.configuration.Configuration;

import java.io.Serializable;

public class SaleBillCustomerJoiner extends SaleCustomerJoiner implements Serializable {
    private static final long serialVersionUID = 1L;

    transient ValueState<Customer> customerState;
    transient ListState<Sale> salesState;

    @Override
    Sale enrich(Sale sale, Customer customer) {
        sale.setBillCustomer(customer);
        return sale;
    }

    @Override
    ValueState<Customer> getCustomerState() {
        return customerState;
    }

    @Override
    ListState<Sale> getSalesState() {
        return salesState;
    }

    @Override
    public void open(Configuration config) {
        final ValueStateDescriptor<Customer> customerStateDescriptor = new ValueStateDescriptor<>("customerSBCJ", Customer.class);
        customerState = getRuntimeContext().getState(customerStateDescriptor);

        final ListStateDescriptor<Sale> salesStateDescriptor = new ListStateDescriptor<>("salesSBCJ", Sale.class);
        salesState = getRuntimeContext().getListState(salesStateDescriptor);
    }
}
