# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

from constructs import Construct
from aws_cdk import (
    Aws,
    custom_resources as cr
)

class QuickSightGroup(Construct):

    @property
    def group_arn(self):
        return self.__group_arn

    def __init__(
            self,
            scope: Construct,
            id: str,
            iam_policy: cr.AwsCustomResourcePolicy,
            group_name: str,
            username: str,
            identity_region: str,
            **kwargs):

        super().__init__(scope, id, **kwargs)

        aws_account_id = Aws.ACCOUNT_ID
        group_physical_id = id + group_name

        quicksight_group = cr.AwsCustomResource(self, 'QuickSightGroup',
                                                on_create={
                                                    "service": "QuickSight",
                                                    "action": "createGroup",
                                                    "parameters": {
                                                        "AwsAccountId": aws_account_id,
                                                        "GroupName": group_name,
                                                        "Namespace": "default",
                                                        "Description": "Group providing access to QuickSight resources created for the Analytics Reference Architecture"
                                                    },
                                                    "physical_resource_id": cr.PhysicalResourceId.of(group_physical_id),
                                                    "region": identity_region},
                                                on_delete={
                                                    "service": "QuickSight",
                                                    "action": "deleteGroup",
                                                    "parameters": {
                                                        "AwsAccountId": aws_account_id,
                                                        "GroupName": group_name,
                                                        "Namespace": "default",
                                                    },
                                                    "physical_resource_id": cr.PhysicalResourceId.of(group_physical_id),
                                                    "region": identity_region},
                                                policy=iam_policy
                                                )

        self.__group_arn = quicksight_group.get_response_field("Group.Arn")

        membership_physical_id = id + "groupmembership"

        membership = cr.AwsCustomResource(self, 'QuickSightGroupMembership',
                                          on_create={
                                              "service": "QuickSight",
                                              "action": "createGroupMembership",
                                              "parameters": {
                                                  "AwsAccountId": aws_account_id,
                                                  "GroupName": group_name,
                                                  "Namespace": "default",
                                                  "MemberName": username,
                                              },
                                              "physical_resource_id": cr.PhysicalResourceId.of(membership_physical_id),
                                              "region": identity_region},
                                          on_delete={
                                              "service": "QuickSight",
                                              "action": "deleteGroupMembership",
                                              "parameters": {
                                                  "AwsAccountId": aws_account_id,
                                                  "GroupName": group_name,
                                                  "Namespace": "default",
                                                  "MemberName": username,
                                              },
                                              "physical_resource_id": cr.PhysicalResourceId.of(membership_physical_id),
                                              "region": identity_region},
                                          policy=iam_policy
                                          )

        membership.node.add_dependency(quicksight_group)
