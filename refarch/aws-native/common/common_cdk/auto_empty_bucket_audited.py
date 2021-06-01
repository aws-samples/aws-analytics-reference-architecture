# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

from aws_cdk.core import Construct
from aws_cdk.aws_glue import Database
from aws_cdk.aws_s3 import IBucket

from common.common_cdk.auto_empty_bucket import AutoEmptyBucket
from common.common_cdk.audit_trail_glue import AuditTrailGlue


class AutoEmptyAuditedBucket(AutoEmptyBucket):

    def __init__(self, scope: Construct, id: str, bucket_name: str, uuid: str, log_bucket: IBucket, audit_db: Database, **kwargs):
        super(AutoEmptyAuditedBucket, self).__init__(scope=scope, id=id, bucket_name=bucket_name, uuid=uuid, **kwargs)

        AuditTrailGlue(self, 'GlueAudit',
                       log_bucket=log_bucket,
                       audit_bucket=self.bucket,
                       audit_db=audit_db,
                       audit_table=bucket_name)
