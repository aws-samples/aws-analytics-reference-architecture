// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

package com.amazonaws.ara.streaming.utils;

import com.amazonaws.ara.streaming.dto.Sale;
import org.apache.flink.core.io.SimpleVersionedSerializer;
import org.apache.flink.streaming.api.functions.sink.filesystem.BucketAssigner;
import org.apache.flink.streaming.api.functions.sink.filesystem.bucketassigners.SimpleVersionedStringSerializer;

import java.time.OffsetDateTime;

public class SaleBucketAssigner implements BucketAssigner<Sale, String> {
    private final String prefix;

    public SaleBucketAssigner(String prefix) {
        this.prefix = prefix;
    }

    @Override
    public String getBucketId(Sale element, Context context) {
        final OffsetDateTime offsetDateTime = OffsetDateTime
                .parse(element.getSaleDatetime());

        return String.format("/%s%04d-%02d-%02d",
                prefix,
                offsetDateTime.getYear(),
                offsetDateTime.getMonthValue(),
                offsetDateTime.getDayOfMonth());
    }

    @Override
    public SimpleVersionedSerializer<String> getSerializer() {
        return SimpleVersionedStringSerializer.INSTANCE;
    }
}
