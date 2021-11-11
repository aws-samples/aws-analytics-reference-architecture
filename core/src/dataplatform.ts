// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { KubernetesVersion } from '@aws-cdk/aws-eks';
import { CfnOutput, Construct } from '@aws-cdk/core';
import { DataPlatformNotebook, DataPlatformNotebookProp, StudioUserDefinition } from './dataplatform-notebook';
import { EmrEksCluster } from './emr-eks-cluster';

export interface DataPlatformProps {
  /**
    * Amazon EKS Admin Role
   * */
  readonly eksAdminRoleArn: string;

  /**
   * Amazon EKS Cluster Name
   * */
  readonly eksClusterName: string;
}


export class DataPlatform extends Construct {

  private readonly emrEks: EmrEksCluster;
  private readonly dataPlatformMapping: Map<string, DataPlatformNotebook>;

  constructor(scope: Construct, id: string, props: DataPlatformProps) {
    super(scope, id);
    //Create new Amazon EKS cluster for Amazon EMR or get one already create for previous EMR on EKS cluster
    //This avoid creating a new cluster everytime an object is initialized
    this.emrEks = EmrEksCluster.getOrCreate(scope, props.eksAdminRoleArn, KubernetesVersion.V1_20, props.eksClusterName);
    this.dataPlatformMapping = new Map<string, DataPlatformNotebook>();

  }

  public addNotebookPlatform (notebookPlatformName: string, dataPlatformNotebookProps: DataPlatformNotebookProp) : void {

    if (!this.dataPlatformMapping.has(notebookPlatformName)) {
      let notebookPlatform = new DataPlatformNotebook(this, notebookPlatformName, {
        emrEks: this.emrEks,
        dataPlatformProps: dataPlatformNotebookProps,
        serviceToken: this.emrEks.managedEndpointProviderServiceToken,
      });

      this.dataPlatformMapping.set(notebookPlatformName, notebookPlatform);

      new CfnOutput(this, `emrStudioUrl-${dataPlatformNotebookProps.studioName}`, {
        value: notebookPlatform.studioUrl,
      });
    } else {
      throw new Error(`A dataplatform with name ${notebookPlatformName} already exists in stack, please choose another name`);
    }
  }

  public addUsersNotebookPlatform (notebookPlatformName: string, userList: StudioUserDefinition[] ): void {
    if (this.dataPlatformMapping.has(notebookPlatformName)) {
      this.dataPlatformMapping.get(notebookPlatformName)!.addUser(userList);
    }
  }

}
