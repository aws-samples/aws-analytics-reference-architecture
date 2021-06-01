// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

package com.amazonaws.ara.streaming.operators;

import com.amazonaws.ara.streaming.dto.Promo;
import com.opencsv.CSVParser;
import com.opencsv.CSVParserBuilder;
import org.apache.flink.api.common.functions.MapFunction;

import java.io.ObjectInputStream;

public class PromoParser implements MapFunction<String, Promo> {
    private static final long serialVersionUID = 1L;
    public static final String PROMO_ID = "promo_id";
    transient CSVParser csvParser;

    public PromoParser() {
        csvParser = new CSVParserBuilder()
                .withSeparator(',')
                .withQuoteChar('"')
                .withEscapeChar('\\')
                .build();
    }

    @Override
    public Promo map(String value) throws Exception {
        final String[] fields = csvParser.parseLine(value);

        if (fields.length != 8) {
            throw new IllegalArgumentException("Expected Promo entry, got:" + value);
        }

        try {
            if (fields[0].equals(PROMO_ID)) {
                // first line
                return null;
            } else {
                final Promo promo = new Promo();
                promo.setPromoId(fields[0]);
                promo.setCost(fields[1]);
                promo.setResponseTarget(Long.valueOf(fields[2]));
                promo.setPromoName(fields[3]);
                promo.setPurpose(fields[4]);
                promo.setPromoStartDate(fields[5]);
                promo.setPromoEndDate(fields[6]);

                // skip promo_datetime

                return promo;
            }
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private void readObject(ObjectInputStream stream) {
        csvParser = new CSVParserBuilder()
                .withSeparator(',')
                .withQuoteChar('"')
                .withEscapeChar('\\')
                .build();
    }
}
