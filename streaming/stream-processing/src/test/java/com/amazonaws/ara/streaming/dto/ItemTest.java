// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

package com.amazonaws.ara.streaming.dto;

import org.apache.flink.shaded.jackson2.com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ItemTest {
    private static final ObjectMapper mapper = new ObjectMapper();

    @Test
    void shouldDeserializeFromJson() throws IOException {
        // Given
        final String json = "{\n" +
                "  \"item_id\": 1,\n" +
                "  \"product_name\": \"string\",\n" +
                "  \"item_desc\": \"string\",\n" +
                "  \"brand\": \"string\",\n" +
                "  \"class\": \"string\",\n" +
                "  \"category\": \"string\",\n" +
                "  \"manufact\": \"string\",\n" +
                "  \"size\": \"string\",\n" +
                "  \"color\": \"string\",\n" +
                "  \"units\": \"string\",\n" +
                "  \"container\": \"string\"\n" +
                "}\n";

        // When
        final Item item = mapper.readValue(json, Item.class);

        // Then
        assertEquals(1L, item.getItemId());
        assertEquals("string", item.getProductName());
        assertEquals("string", item.getItemDesc());
        assertEquals("string", item.getBrand());
        assertEquals("string", item.getClassName());
        assertEquals("string", item.getCategory());
        assertEquals("string", item.getManufact());
        assertEquals("string", item.getSize());
        assertEquals("string", item.getColor());
        assertEquals("string", item.getUnits());
        assertEquals("string", item.getContainer());
    }
}
