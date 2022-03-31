# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0


import boto3
import os
import logging


ram = boto3.client("ram", os.getenv("AWS_REGION"))
log = logging.getLogger()
log.setLevel(logging.INFO)

CENTRAL_ACC_ID = os.getenv("CENTRAL_ACC_ID")


def on_event(event, ctx):
    log.info(event)

    ram_invites = ram.get_resource_share_invitations()
    for ri in ram_invites["resourceShareInvitations"]:
        if ri["status"] == "PENDING" and ri["senderAccountId"] == CENTRAL_ACC_ID:
            try:
                res = ram.accept_resource_share_invitation(
                    resourceShareInvitationArn=ri["resourceShareInvitationArn"]
                )
            except Exception as e:
                raise Exception(f"Could not accept RAM share: {e}")

            if res["resourceShareInvitation"]["status"] == "ACCEPTED":
                log.info(
                    f"SUCCESS: accepted RAM SHARE {res['resourceShareInvitation']['resourceShareName']}"
                )
