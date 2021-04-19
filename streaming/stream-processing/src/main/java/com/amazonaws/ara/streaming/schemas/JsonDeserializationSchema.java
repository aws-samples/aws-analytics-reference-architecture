// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

package com.amazonaws.ara.streaming.schemas;

import org.apache.flink.api.common.serialization.AbstractDeserializationSchema;
import org.apache.flink.shaded.jackson2.com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;

/**
 * Basic DeserializationSchema to handler JSON -> POJO
 *
 * @param <T>
 */
public class JsonDeserializationSchema<T> extends AbstractDeserializationSchema<T> {
    private final ObjectMapper mapper = new ObjectMapper();
    private final Class<T> tClass;

    public JsonDeserializationSchema(Class<T> tClass) {
        super(tClass);
        this.tClass = tClass;
    }

    @Override
    public T deserialize(byte[] message) throws IOException {
        return mapper.readValue(message, tClass);
    }
}
