// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

package com.amazonaws.ara.streaming.operators;

import com.amazonaws.ara.streaming.dto.Address;
import org.apache.flink.configuration.Configuration;
import org.apache.flink.streaming.api.functions.async.ResultFuture;
import org.apache.flink.streaming.api.functions.async.RichAsyncFunction;

import java.util.Collections;

public class AsyncGeocoderRequest extends RichAsyncFunction<Address, Address> {

    @Override
    public void open(Configuration parameters) throws Exception {
        // The rest client will be initialized here
    }

    @Override
    public void asyncInvoke(Address input, ResultFuture<Address> resultFuture) throws Exception {
        // Pass-through for now
        resultFuture.complete(Collections.singletonList(input));
    }
}
