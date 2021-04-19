// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

package com.amazonaws.ara.streaming.dto;

import org.apache.flink.shaded.jackson2.com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertEquals;

class CustomerTest {
    private static final ObjectMapper mapper = new ObjectMapper();

    @Test
    void shouldDeserializeFromJson() throws IOException {
        // Given
        final String json = "{\n" +
                "  \"customer_id\": \"AAAAAAAABCMDBAAA\",\n" +
                "  \"salutation\": \"Mr.\",\n" +
                "  \"first_name\": \"Kevin\",\n" +
                "  \"last_name\": \"Edwards\",\n" +
                "  \"birth_country\": \"BELIZE\",\n" +
                "  \"email_address\": \"Kevin.Edwards@aOgj.org\",\n" +
                "  \"address_id\": \"AAAAAAAAICGLAAAA\",\n" +
                "  \"gender\": \"F\",\n" +
                "  \"marital_status\": \"U\",\n" +
                "  \"education_status\": \"Advanced Degree\",\n" +
                "  \"purchase_estimate\": 7500,\n" +
                "  \"credit_rating\": \"Good\",\n" +
                "  \"buy_potential\": \"501-1000\",\n" +
                "  \"vehicle_count\": 1,\n" +
                "  \"lower_bound\": 160001,\n" +
                "  \"upper_bound\": 170000,\n" +
                "  \"birth_date\": \"1943-03-22\",\n" +
                "  \"customer_datetime\": \"2020-01-01T04:18:10.753Z\"\n" +
                "}";

        // When
        final Customer customer = mapper.readValue(json, Customer.class);

        // Then
        assertEquals("AAAAAAAABCMDBAAA", customer.getCustomerId());
        assertEquals("Mr.", customer.getSalutation());
        assertEquals("Kevin", customer.getFirstName());
        assertEquals("Edwards", customer.getLastName());
        assertEquals("BELIZE", customer.getBirthCountry());
        assertEquals("Kevin.Edwards@aOgj.org", customer.getEmailAddress());
        assertEquals("AAAAAAAAICGLAAAA", customer.getAddressId());
        assertEquals("F", customer.getGender());
        assertEquals("U", customer.getMaritalStatus());
        assertEquals("Advanced Degree", customer.getEducationStatus());
        assertEquals(7500L, customer.getPurchaseEstimate());
        assertEquals("Good", customer.getCreditRating());
        assertEquals("501-1000", customer.getBuyPotential());
        assertEquals(1L, customer.getVehicleCount());
        assertEquals(160001L, customer.getLowerBound());
        assertEquals(170000L, customer.getUpperBound());
        assertEquals("1943-03-22", customer.getBirthDate());
        assertEquals("2020-01-01T04:18:10.753Z", customer.getCustomerDatetime());
    }
}
