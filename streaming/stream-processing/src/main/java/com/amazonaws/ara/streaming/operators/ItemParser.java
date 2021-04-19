// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

package com.amazonaws.ara.streaming.operators;

import com.amazonaws.ara.streaming.dto.Item;
import com.opencsv.CSVParser;
import com.opencsv.CSVParserBuilder;
import org.apache.flink.api.common.functions.MapFunction;

import java.io.ObjectInputStream;

public class ItemParser implements MapFunction<String, Item> {
    private static final long serialVersionUID = 1L;
    public static final String ITEM_ID = "item_id";
    transient CSVParser csvParser;

    public ItemParser() {
        csvParser = new CSVParserBuilder()
                .withSeparator(',')
                .withQuoteChar('"')
                .withEscapeChar('\\')
                .build();
    }

    @Override
    public Item map(String value) throws Exception {
        final String[] fields = csvParser.parseLine(value);

        if (fields.length != 12) {
            throw new IllegalArgumentException("Expected Item entry, got:" + value);
        }

        try {
            if (fields[0].equals(ITEM_ID)) {
                return null;
            } else {
                final Item item = new Item();

                item.setItemId(Long.valueOf(fields[0]));
                item.setItemDesc(fields[1]);
                item.setBrand(fields[2]);
                item.setClassName(fields[3]);
                item.setCategory(fields[4]);
                item.setManufact(fields[5]);
                item.setSize(fields[6]);
                item.setColor(fields[7]);
                item.setUnits(fields[8]);
                item.setContainer(fields[9]);
                item.setProductName(fields[10]);
                // skip item_datetime

                return item;
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
