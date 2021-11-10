// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { KubernetesVersion } from '@aws-cdk/aws-eks';
import { Construct, NestedStack } from '@aws-cdk/core';
import { DataPlatformNotebook, DataPlatformNotebookProp, StudioUserDefinition } from './dataplatform-notebook';
import { EmrEksCluster } from './emr-eks-cluster';

export interface DataPlatformProps {

  /**
    * Amazon EKS Admin Role
   * */
  readonly eksAdminRoleArn: string;

  /**
   * Amazon EKS Admin Role
   * */
  readonly eksClusterName: string;

}


export class DataPlatform extends Construct {

  private readonly emrEks: EmrEksCluster;
  private readonly dataPlatformMapping: Map<string, DataPlatformNotebook>;
  //private readonly nestedStack: NestedStack;
  private readonly emrOnEksNestedStack: NestedStack;


  constructor(scope: Construct, id: string, props: DataPlatformProps) {
    super(scope, id);
    //Create new Amazon EKS cluster for Amazon EMR or get one already create for previous EMR on EKS cluster
    //This avoid creating a new cluster everytime an object is initialized

    this.emrOnEksNestedStack = new NestedStack(scope, 'test');

    this.emrEks = EmrEksCluster.getOrCreate(scope, props.eksAdminRoleArn, KubernetesVersion.V1_20, props.eksClusterName);
    this.dataPlatformMapping = new Map<string, DataPlatformNotebook>();

  }


  public addNotebookPlatform (notebookPlatformName: string, dataPlatformNotebookProps: DataPlatformNotebookProp) : void {

    let notebookPlatform = new DataPlatformNotebook(this, notebookPlatformName, {
      emrEks: this.emrEks,
      dataPlatformProps: dataPlatformNotebookProps,
      serviceToken: this.emrEks.managedEndpointProviderServiceToken,
      emrOnEksStack: this.emrOnEksNestedStack,
    });

    this.dataPlatformMapping.set(notebookPlatformName, notebookPlatform);

  }

  public addUsersNotebookPlatform (notebookPlatformName: string, userList: StudioUserDefinition[] ): void {
    if (this.dataPlatformMapping.has(notebookPlatformName)) {
      this.dataPlatformMapping.get(notebookPlatformName)!.addUser(userList);
    }
  }

}
