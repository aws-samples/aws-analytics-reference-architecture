// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

package com.amazonaws.ara.streaming.operators;

import com.amazonaws.ara.streaming.dto.Sale;
import org.apache.flink.api.common.functions.RuntimeContext;
import org.apache.flink.shaded.jackson2.com.fasterxml.jackson.core.JsonProcessingException;
import org.apache.flink.shaded.jackson2.com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.flink.streaming.connectors.elasticsearch.ElasticsearchSinkFunction;
import org.apache.flink.streaming.connectors.elasticsearch.RequestIndexer;
import org.elasticsearch.action.index.IndexRequest;
import org.elasticsearch.client.Requests;
import org.elasticsearch.common.xcontent.XContentType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Properties;

public class SaleElasticsearchSinkFunction implements ElasticsearchSinkFunction<Sale> {
    private static final ObjectMapper objectMapper = new ObjectMapper();
    private static final Logger log = LoggerFactory.getLogger(SaleElasticsearchSinkFunction.class);

    private static final long serialVersionUID = 1L;
    private final String index;

    public SaleElasticsearchSinkFunction(Properties props) {
        this.index = props.getProperty("IndexName");
    }

    public IndexRequest createIndexRequest(Sale sale) {

        try {
            byte[] json = objectMapper.writeValueAsBytes(sale);

            return Requests.indexRequest()
                    .index(this.index)
                    .type("_doc")
                    .source(json, XContentType.JSON);
        } catch (JsonProcessingException e) {
            return null;
        }
    }

    @Override
    public void process(Sale sale, RuntimeContext ctx, RequestIndexer indexer) {
        log.debug("Adding {} to indexer", sale);

        final IndexRequest indexRequest = createIndexRequest(sale);

        if (indexRequest != null) {
            indexer.add(indexRequest);
        } else {
            log.warn("Could not process {} for indexing", sale);
        }
    }
}
