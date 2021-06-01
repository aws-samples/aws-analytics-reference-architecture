// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

package com.amazonaws.ara.streaming.dto;

import org.apache.flink.shaded.jackson2.com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertEquals;

class WarehouseTest {
    private static final ObjectMapper mapper = new ObjectMapper();

    @Test
    void shouldDeserializeFromJson() throws IOException {
        // Given
        final String json = "{\n" +
                "  \"id\": 1,\n" +
                "  \"name\": \"string\",\n" +
                "  \"sq_ft\": 1,\n" +
                "  \"street_number\": \"string\",\n" +
                "  \"street_name\": \"string\",\n" +
                "  \"street_type\": \"string\",\n" +
                "  \"suite_number\": \"string\",\n" +
                "  \"city\": \"string\",\n" +
                "  \"county\": \"string\",\n" +
                "  \"state\": \"string\",\n" +
                "  \"zip\": \"string\",\n" +
                "  \"country\": \"string\",\n" +
                "  \"gmt_offset\": \"99999.99\"\n" +
                "}\n";

        // When
        final Warehouse warehouse = mapper.readValue(json, Warehouse.class);

        // Then
        assertEquals(1L, warehouse.getId());
        assertEquals("string", warehouse.getName());
        assertEquals("1", warehouse.getSqFt());
        assertEquals("string", warehouse.getStreetNumber());
        assertEquals("string", warehouse.getStreetName());
        assertEquals("string", warehouse.getStreetType());
        assertEquals("string", warehouse.getSuiteNumber());
        assertEquals("string", warehouse.getCity());
        assertEquals("string", warehouse.getCounty());
        assertEquals("string", warehouse.getState());
        assertEquals("string", warehouse.getZip());
        assertEquals("string", warehouse.getCountry());
        assertEquals("99999.99", warehouse.getGmtOffset());
    }
}
