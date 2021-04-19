// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

package com.amazonaws.ara.streaming.utils;

import com.amazonaws.ara.streaming.dto.Sale;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class SaleBucketAssignerTest {

    @Test
    void shouldCreateBucketIdFromDate() {
        // Given
        final String dateTime = "2020-01-01T08:00:00Z";
        final Sale sale = new Sale();
        sale.setSaleDatetime(dateTime);
        final SaleBucketAssigner bucketAssigner = new SaleBucketAssigner("prefix/");

        // When
        final String bucketId = bucketAssigner.getBucketId(sale, null);

        // Then
        assertEquals("/prefix/2020-01-01", bucketId);
    }
}
