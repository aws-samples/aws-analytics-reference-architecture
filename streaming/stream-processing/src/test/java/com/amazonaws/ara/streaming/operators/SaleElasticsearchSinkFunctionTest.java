// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

package com.amazonaws.ara.streaming.operators;

import com.amazonaws.ara.streaming.dto.Sale;
import org.apache.flink.streaming.connectors.elasticsearch.RequestIndexer;
import org.elasticsearch.action.delete.DeleteRequest;
import org.elasticsearch.action.index.IndexRequest;
import org.elasticsearch.action.update.UpdateRequest;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Properties;

import static org.junit.jupiter.api.Assertions.assertEquals;

class SaleElasticsearchSinkFunctionTest {
    @Test
    void shouldIndexDocument() {
        // Given
        Properties props = new Properties();
        props.setProperty("IndexName", "test");

        Sale sale = new Sale();
        sale.setListPrice("0.0");

        // When
        final SaleElasticsearchSinkFunction sinkFunction = new SaleElasticsearchSinkFunction(props);

        RequestIndexer indexer = new TestRequestIndexer();

        sinkFunction.process(sale, null, indexer);

        // Then
        assertEquals(1, TestRequestIndexer.indexRequests.size());
        final IndexRequest request = TestRequestIndexer.indexRequests.get(0);
        assertEquals("test", request.index());
        assertEquals("_doc", request.type());
    }

    private static class TestRequestIndexer implements RequestIndexer {
        public static List<IndexRequest> indexRequests = new ArrayList<>();

        @Override
        public void add(DeleteRequest... deleteRequests) {
            // do nothing
        }

        @Override
        public void add(IndexRequest... indexRequests) {
            TestRequestIndexer.indexRequests.addAll(Arrays.asList(indexRequests));
        }

        @Override
        public void add(UpdateRequest... updateRequests) {
            // do nothing
        }
    }
}
