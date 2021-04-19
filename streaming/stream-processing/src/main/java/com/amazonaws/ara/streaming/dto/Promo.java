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
public class Promo {
    String promoId;
    String cost; // BigDecimal
    Long responseTarget;
    String promoName;
    String purpose;
    String promoStartDate;
    String promoEndDate;
}
