// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

package com.amazonaws.ara.streaming.dto;

import org.apache.flink.shaded.jackson2.com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertEquals;

class AddressTest {

    private static final ObjectMapper mapper = new ObjectMapper();

    @Test
    void shouldDeserializeFromJson() throws IOException {
        // Given
        final String json = "{\n" +
                "  \"address_id\": \"AAAAAAAAJPPBAAAA\",\n" +
                "  \"city\": \"Clinton\",\n" +
                "  \"county\": \"Armstrong County\",\n" +
                "  \"state\": \"TX\",\n" +
                "  \"zip\": \"78222\",\n" +
                "  \"country\": \"United States\",\n" +
                "  \"gmt_offset\": -6.00,\n" +
                "  \"location_type\": \"apartment\",\n" +
                "  \"street\": \"837 Center Hickory Road\",\n" +
                "  \"address_datetime\": \"2020-01-01T05:05:45.536Z\"\n" +
                "}";

        // When
        final Address address = mapper.readValue(json, Address.class);

        // Then
        assertEquals("AAAAAAAAJPPBAAAA", address.getAddressId());
        assertEquals("Clinton", address.getCity());
        assertEquals("Armstrong County", address.getCounty());
        assertEquals("TX", address.getState());
        assertEquals("78222", address.getZip());
        assertEquals("United States", address.getCountry());
        assertEquals("-6.00", address.getGmtOffset());
        assertEquals("apartment", address.getLocationType());
        assertEquals("837 Center Hickory Road", address.getStreet());
        assertEquals("2020-01-01T05:05:45.536Z", address.getAddressDatetime());
    }
}
