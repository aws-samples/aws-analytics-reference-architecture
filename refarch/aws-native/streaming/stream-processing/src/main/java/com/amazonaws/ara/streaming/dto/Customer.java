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
public class Customer {
    String customerId;
    String salutation;
    String firstName;
    String lastName;
    String birthCountry;
    String emailAddress;
    String addressId;
    Address address; // enrichment
    String gender;
    String maritalStatus;
    String educationStatus;
    Long purchaseEstimate;
    String creditRating;
    String buyPotential;
    Long vehicleCount;
    Long lowerBound;
    Long upperBound;
    String birthDate;
    String customerDatetime;
}
