// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

package com.amazonaws.ara.streaming.operators;

import com.amazonaws.ara.streaming.dto.Promo;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

class PromoParserTest {
    @Test
    void shouldParseCsvLine() throws Exception {
        // Given
        String csvLine = "1,0.0,1,promo_name,purpose,start_date,end_date,promo_datetime";
        PromoParser parser = new PromoParser();

        // When
        final Promo promo = parser.map(csvLine);

        // Then
        assertEquals("1", promo.getPromoId());
        assertEquals("0.0", promo.getCost());
        assertEquals(1, promo.getResponseTarget());
        assertEquals("promo_name", promo.getPromoName());
        assertEquals("purpose", promo.getPurpose());
        assertEquals("start_date", promo.getPromoStartDate());
        assertEquals("end_date", promo.getPromoEndDate());
    }

    @Test
    void shouldNotParseHeader() throws Exception {
        // Given
        String csvLine = "promo_id,cost,response_target,promo_name,purpose,start_date,end_date,promo_datetime";
        PromoParser parser = new PromoParser();

        // When
        final Promo promo = parser.map(csvLine);

        // Then
        assertNull(promo);
    }

    @Test
    void shouldFailParsingInvalidCsvLine() {
        // Given
        String invalidCsvLine = "1";
        PromoParser parser = new PromoParser();

        // Then
        assertThrows(IllegalArgumentException.class, () -> parser.map(invalidCsvLine));
    }
}
