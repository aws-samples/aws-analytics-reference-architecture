// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

package com.amazonaws.ara.streaming.operators;

import com.amazonaws.ara.streaming.dto.Item;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

class ItemParserTest {

    @Test
    void shouldParseCsvLine() throws Exception {
        // Given
        String csvLine = "1,item_desc,brand,class,category,manufact,size,color,units,container,product_name,item_datetime";
        ItemParser parser = new ItemParser();

        // When
        final Item item = parser.map(csvLine);

        // Then
        assertEquals(1, item.getItemId());
        assertEquals("product_name", item.getProductName());
        assertEquals("item_desc", item.getItemDesc());
        assertEquals("brand", item.getBrand());
        assertEquals("class", item.getClassName());
        assertEquals("category", item.getCategory());
        assertEquals("manufact", item.getManufact());
        assertEquals("size", item.getSize());
        assertEquals("color", item.getColor());
        assertEquals("units", item.getUnits());
        assertEquals("container", item.getContainer());
    }

    @Test
    void shouldNotParseHeader() throws Exception {
        // Given
        String csvLine = "item_id,item_desc,brand,class,category,manufact,size,color,units,container,product_name,item_datetime";
        ItemParser parser = new ItemParser();

        // When
        final Item item = parser.map(csvLine);

        // Then
        assertNull(item);
    }

    @Test
    void shouldFailParsingInvalidCsvLine() {
        // Given
        String invalidCsvLine = "1";
        ItemParser parser = new ItemParser();

        // Then
        assertThrows(IllegalArgumentException.class, () -> parser.map(invalidCsvLine));
    }
}
