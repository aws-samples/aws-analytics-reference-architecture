# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

import boto3
import traceback
import cfnresponse


def handler(event, context):
    state_machine = event['ResourceProperties']['state_machine']

    try:
        if event['RequestType'] == 'Delete':

            client = boto3.client('stepfunctions')
            response = client.list_state_machines()
            data = response['stateMachines']
            state_machines = [x['stateMachineArn'] for x in data if state_machine in x['name']]

            for sm in state_machines:
                response = client.list_executions(stateMachineArn=sm, statusFilter='RUNNING')
                data = response['executions']
                executions = [x['executionArn'] for x in data]

                for e in executions:
                    client.stop_execution(executionArn=e)

            # Terminate EMR clusters not killed
            client = boto3.client('emr')
            response = client.list_clusters(ClusterStates=['STARTING', 'BOOTSTRAPPING', 'RUNNING', 'WAITING'])
            data = response['Clusters']
            clusters = [x['Id'] for x in data if state_machine in x['Name']]
            for i in clusters:
                client.terminate_job_flows(JobFlowIds=[i])

        cfnresponse.send(event, context, cfnresponse.SUCCESS, {})

    except Exception:
        traceback.print_exc()
        cfnresponse.send(event, context, cfnresponse.FAILED, {})
