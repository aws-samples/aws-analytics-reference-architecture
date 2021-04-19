// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

package com.amazonaws.ara.streaming.dto;

import org.apache.flink.shaded.jackson2.com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertEquals;

class SaleTest {
    private static final ObjectMapper mapper = new ObjectMapper();

    @Test
    void shouldDeserializeFromJson() throws IOException {
        // Given
        final String json = "{\n" +
                "  \"order_id\": 771,\n" +
                "  \"item_id\": 14510,\n" +
                "  \"quantity\": 17,\n" +
                "  \"wholesale_cost\": 14.69,\n" +
                "  \"list_price\": 41.13,\n" +
                "  \"sales_price\": 11.92,\n" +
                "  \"ext_discount_amt\": 496.57,\n" +
                "  \"ext_sales_price\": 202.64,\n" +
                "  \"ext_wholesale_cost\": 249.73,\n" +
                "  \"ext_list_price\": 699.21,\n" +
                "  \"ext_tax\": 6.07,\n" +
                "  \"coupon_amt\": 0.00,\n" +
                "  \"ext_ship_cost\": 279.65,\n" +
                "  \"net_paid\": 202.64,\n" +
                "  \"net_paid_inc_tax\": 208.71,\n" +
                "  \"net_paid_inc_ship\": 482.29,\n" +
                "  \"net_paid_inc_ship_tax\": 488.36,\n" +
                "  \"net_profit\": -47.09,\n" +
                "  \"bill_customer_id\": \"AAAAAAAAHBKIAAAA\",\n" +
                "  \"ship_customer_id\": \"AAAAAAAANKJJAAAA\",\n" +
                "  \"warehouse_id\": \"AAAAAAAABAAAAAAA\",\n" +
                "  \"promo_id\": \"AAAAAAAANBBAAAAA\",\n" +
                "  \"ship_delay\": \"LIBRARY\",\n" +
                "  \"ship_mode\": \"SEA\",\n" +
                "  \"ship_carrier\": \"RUPEKSA\",\n" +
                "  \"sale_datetime\": \"2020-01-01T13:15:14.852Z\"\n" +
                "}";

        // When
        final Sale sale = mapper.readValue(json, Sale.class);

        // Then
        assertEquals(771L, sale.getOrderId());
        assertEquals(14510L, sale.getItemId());
        assertEquals(17L, sale.getQuantity());
        assertEquals("14.69", sale.getWholesaleCost());
        assertEquals("41.13", sale.getListPrice());
        assertEquals("11.92", sale.getSalesPrice());
        assertEquals("496.57", sale.getExtDiscountAmt());
        assertEquals("202.64", sale.getExtSalesPrice());
        assertEquals("249.73", sale.getExtWholesaleCost());
        assertEquals("699.21", sale.getExtListPrice());
        assertEquals("6.07", sale.getExtTax());
        assertEquals("0.00", sale.getCouponAmt());
        assertEquals("279.65", sale.getExtShipCost());
        assertEquals("202.64", sale.getNetPaid());
        assertEquals("208.71", sale.getNetPaidIncTax());
        assertEquals("482.29", sale.getNetPaidIncShip());
        assertEquals("488.36", sale.getNetPaidIncShipTax());
        assertEquals("-47.09", sale.getNetProfit());
        assertEquals("AAAAAAAAHBKIAAAA", sale.getBillCustomerId());
        assertEquals("AAAAAAAANKJJAAAA", sale.getShipCustomerId());
        assertEquals("AAAAAAAABAAAAAAA", sale.getWarehouseId());
        assertEquals("AAAAAAAANBBAAAAA", sale.getPromoId());
        assertEquals("LIBRARY", sale.getShipDelay());
        assertEquals("SEA", sale.getShipMode());
        assertEquals("RUPEKSA", sale.getShipCarrier());
        assertEquals("2020-01-01T13:15:14.852Z", sale.getSaleDatetime());
    }
}
