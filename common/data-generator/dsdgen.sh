# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0
#!/bin/bash

sudo yum install -y gcc make flex bison byacc git &&
cd /home/hadoop &&
git clone https://github.com/vgkowski/tpcds-kit.git &&
cd tpcds-kit/tools &&
make OS=LINUX