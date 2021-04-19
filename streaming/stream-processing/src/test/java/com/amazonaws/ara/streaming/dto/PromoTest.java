// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

package com.amazonaws.ara.streaming.dto;

import org.apache.flink.shaded.jackson2.com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertEquals;

class PromoTest {
    private static final ObjectMapper mapper = new ObjectMapper();

    @Test
    void shouldDeserializeFromJson() throws IOException {
        // Given
        final String json = "{\n" +
                "  \"promo_id\": \"string\",\n" +
                "  \"cost\": 0.0,\n" +
                "  \"response_target\": 1,\n" +
                "  \"promo_name\": \"string\",\n" +
                "  \"purpose\": \"string\",\n" +
                "  \"promo_start_date\": \"string\",\n" +
                "  \"promo_end_date\": \"string\"\n" +
                "}";

        // When
        final Promo promo = mapper.readValue(json, Promo.class);

        // Then
        assertEquals("string", promo.getPromoId());
        assertEquals("0.0", promo.getCost());
        assertEquals(1L, promo.getResponseTarget());
        assertEquals("string", promo.getPromoName());
        assertEquals("string", promo.getPurpose());
        assertEquals("string", promo.getPromoStartDate());
        assertEquals("string", promo.getPromoEndDate());
    }
}
