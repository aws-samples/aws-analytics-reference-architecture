// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { KubernetesVersion } from '@aws-cdk/aws-eks';
import { CfnOutput, Construct, Stack } from '@aws-cdk/core';
import { EmrEksCluster } from '../emr-eks-cluster';
//import { EmrEksNodegroup } from '../emr-eks-nodegroup';
import { DataPlatformNotebook, DataPlatformNotebookProp, StudioUserDefinition } from './dataplatform-notebook';


/**
 * The properties for DataPlatform Infrastructure Construct.
 * The properties are used to create an EKS cluster
 * The EKS cluster will have the same name as the id of the stack,
 * this is to ensure only one EKS cluster is created across the stack
 */
export interface DataPlatformProps {
  /**
    * Amazon EKS Admin Role
   * */
  readonly eksAdminRoleArn: string;

}


export class DataPlatform extends Construct {

  public static getOrCreate(scope: Construct, stackName: string, props: DataPlatformProps) {

    const stack = Stack.of(scope);
    const id = `${stackName}`;

    let dataPlatform: DataPlatform;

    if (stack.node.tryFindChild(id) == undefined) {
      dataPlatform = new DataPlatform(stack, id, props);
    }

    return stack.node.tryFindChild(id) as DataPlatform || dataPlatform!;
  }

  private readonly emrEks: EmrEksCluster;
  private readonly dataPlatformMapping: Map<string, DataPlatformNotebook>;
  private list: string[] = [];


  constructor(scope: Construct, id: string, props: DataPlatformProps) {
    super(scope, id);
    //Create new Amazon EKS cluster for Amazon EMR or get one already create for previous EMR on EKS cluster
    //This avoid creating a new cluster everytime an object is initialized
    this.emrEks = EmrEksCluster.getOrCreate(scope, props.eksAdminRoleArn, KubernetesVersion.V1_20, id);
    this.dataPlatformMapping = new Map<string, DataPlatformNotebook>();

  }

  public addNotebookPlatform (notebookPlatformName: string, dataPlatformNotebookProps: DataPlatformNotebookProp) : void {

    if (!this.dataPlatformMapping.has(notebookPlatformName) ||
        !this.list.includes(dataPlatformNotebookProps.studioName) ||
        !this.list.includes(dataPlatformNotebookProps.emrVCNamespace) ) {

      let notebookPlatform = new DataPlatformNotebook(this, notebookPlatformName, {
        emrEks: this.emrEks,
        dataPlatformProps: dataPlatformNotebookProps,
        serviceToken: this.emrEks.managedEndpointProviderServiceToken,
      });

      this.list.push(dataPlatformNotebookProps.studioName);
      this.list.push(dataPlatformNotebookProps.emrVCNamespace);

      this.dataPlatformMapping.set(notebookPlatformName, notebookPlatform);

      new CfnOutput(this, `emrStudioUrl-${dataPlatformNotebookProps.studioName}`, {
        value: notebookPlatform.studioUrl,
      });
    } else {
      throw new Error(`A dataplatform with name ${notebookPlatformName} or 
        ${dataPlatformNotebookProps.studioName}  or ${dataPlatformNotebookProps.emrVCNamespace} 
        already exists in stack, please choose another name`);
    }
  }

  public addUsersNotebookPlatform (notebookPlatformName: string, userList: StudioUserDefinition[] ): void {
    if (this.dataPlatformMapping.has(notebookPlatformName)) {
      this.dataPlatformMapping.get(notebookPlatformName)!.addUser(userList);
    }
  }

}
