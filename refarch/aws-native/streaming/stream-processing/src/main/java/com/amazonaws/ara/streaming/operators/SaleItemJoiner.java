// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

package com.amazonaws.ara.streaming.operators;

import com.amazonaws.ara.streaming.dto.Item;
import com.amazonaws.ara.streaming.dto.Sale;
import org.apache.flink.annotation.VisibleForTesting;
import org.apache.flink.api.common.state.ListState;
import org.apache.flink.api.common.state.ListStateDescriptor;
import org.apache.flink.api.common.state.ValueState;
import org.apache.flink.api.common.state.ValueStateDescriptor;
import org.apache.flink.configuration.Configuration;
import org.apache.flink.streaming.api.functions.co.CoProcessFunction;
import org.apache.flink.util.Collector;

public class SaleItemJoiner extends CoProcessFunction<Sale, Item, Sale> {
    private static final long serialVersionUID = 1L;

    transient ValueState<Item> itemState;
    transient ListState<Sale> salesState;

    @VisibleForTesting
    static Sale enrich(Sale sale, Item item) {
        sale.setItem(item);
        return sale;
    }

    @Override
    public void open(Configuration config) {
        final ValueStateDescriptor<Item> itemStateDescriptor = new ValueStateDescriptor<>("itemSIJ", Item.class);
        itemState = getRuntimeContext().getState(itemStateDescriptor);

        final ListStateDescriptor<Sale> salesStateDescriptor = new ListStateDescriptor<>("salesSIJ", Sale.class);
        salesState = getRuntimeContext().getListState(salesStateDescriptor);
    }

    @Override
    public void processElement1(Sale value, Context ctx, Collector<Sale> out) throws Exception {
        if (itemState.value() == null) {
            salesState.add(value);
        } else {
            final Item item = itemState.value();
            out.collect(enrich(value, item));
        }
    }

    @Override
    public void processElement2(Item value, Context ctx, Collector<Sale> out) throws Exception {
        itemState.update(value); // Update the state. This state will persist for subsequent sales.

        for (final Sale sale : salesState.get()) {
            out.collect(enrich(sale, value));
        }

        salesState.clear(); // Clear the list of sales to be processed
    }
}
