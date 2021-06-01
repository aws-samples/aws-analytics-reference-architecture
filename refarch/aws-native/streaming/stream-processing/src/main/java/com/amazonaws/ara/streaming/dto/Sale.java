// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

package com.amazonaws.ara.streaming.dto;

import lombok.Data;
import org.apache.flink.shaded.jackson2.com.fasterxml.jackson.annotation.JsonInclude;
import org.apache.flink.shaded.jackson2.com.fasterxml.jackson.databind.PropertyNamingStrategy;
import org.apache.flink.shaded.jackson2.com.fasterxml.jackson.databind.annotation.JsonNaming;

@Data
@JsonNaming(PropertyNamingStrategy.SnakeCaseStrategy.class)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Sale {
    Long orderId;
    Long itemId;
    Item item; // enrichment
    Long quantity;
    String wholesaleCost; // BigDecimal
    String listPrice; // BigDecimal
    String salesPrice; // BigDecimal
    String extDiscountAmt; // BigDecimal
    String extSalesPrice; // BigDecimal
    String extWholesaleCost; // BigDecimal
    String extListPrice; // BigDecimal
    String extTax; // BigDecimal
    String couponAmt; // BigDecimal
    String extShipCost; // BigDecimal
    String netPaid; // BigDecimal
    String netPaidIncTax; // BigDecimal
    String netPaidIncShip; // BigDecimal
    String netPaidIncShipTax; // BigDecimal
    String netProfit; // BigDecimal
    String billCustomerId;
    Customer billCustomer; // enrichment
    String shipCustomerId;
    Customer shipCustomer; // enrichment
    String warehouseId;
    //Warehouse warehouse; // enrichment
    String promoId;
    Promo promo; // enrichment
    String shipDelay;
    String shipMode;
    String shipCarrier;
    String saleDatetime;
}
