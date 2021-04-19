// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

package com.amazonaws.ara.streaming.operators;

import com.amazonaws.ara.streaming.dto.Promo;
import com.amazonaws.ara.streaming.dto.Sale;
import org.apache.flink.annotation.VisibleForTesting;
import org.apache.flink.api.common.state.ListState;
import org.apache.flink.api.common.state.ListStateDescriptor;
import org.apache.flink.api.common.state.ValueState;
import org.apache.flink.api.common.state.ValueStateDescriptor;
import org.apache.flink.configuration.Configuration;
import org.apache.flink.streaming.api.functions.co.CoProcessFunction;
import org.apache.flink.util.Collector;

public class SalePromoJoiner extends CoProcessFunction<Sale, Promo, Sale> {
    private static final long serialVersionUID = 1L;

    transient ValueState<Promo> promoState;
    transient ListState<Sale> salesState;

    @VisibleForTesting
    static Sale enrich(Sale sale, Promo promo) {
        sale.setPromo(promo);
        return sale;
    }

    @Override
    public void open(Configuration config) {
        final ValueStateDescriptor<Promo> promoStateDescriptor = new ValueStateDescriptor<>("promoSPJ", Promo.class);
        promoState = getRuntimeContext().getState(promoStateDescriptor);

        final ListStateDescriptor<Sale> salesStateDescriptor = new ListStateDescriptor<>("salesSPJ", Sale.class);
        salesState = getRuntimeContext().getListState(salesStateDescriptor);
    }

    @Override
    public void processElement1(Sale value, Context ctx, Collector<Sale> out) throws Exception {
        if (value.getPromoId() == null) {
            out.collect(value); // pass-through
        } else if (promoState.value() == null) {
            salesState.add(value);
        } else {
            final Promo promo = promoState.value();
            out.collect(enrich(value, promo));
        }
    }

    @Override
    public void processElement2(Promo value, Context ctx, Collector<Sale> out) throws Exception {
        promoState.update(value); // Update the state. This state will persist for subsequent sales.

        for (final Sale sale : salesState.get()) {
            out.collect(enrich(sale, value));
        }

        salesState.clear(); // Clear the list of sales to be processed
    }
}
