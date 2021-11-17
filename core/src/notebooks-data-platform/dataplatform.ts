// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { KubernetesVersion } from '@aws-cdk/aws-eks';
import { CfnOutput, Construct, Stack } from '@aws-cdk/core';
import { EmrEksCluster } from '../emr-eks-data-platform/emr-eks-cluster';
import { DataPlatformNotebook, DataPlatformNotebookProp, StudioUserDefinition } from './dataplatform-notebook';

/**
 * The properties for DataPlatform Infrastructure Construct.
 * The properties are used to create an EKS cluster
 * The EKS cluster will have the same name as the id of the stack,
 * to ensure only one EKS cluster is created across the stack
 */
export interface DataPlatformProps {
  /**
    * Amazon EKS Admin Role
   * */
  readonly eksAdminRoleArn: string;

}

/**
 * Construct to create an Amazon EKS cluster
 * The construct is used to create a dataplatform which is composed of an EMR Virtual Cluster and an EMR studio
 * Last the construct is used to assign users to the created EMR Studio within the dataplatform
 */
export class DataPlatform extends Construct {

  public static getOrCreate(scope: Construct, props?: DataPlatformProps) {

    const stack = Stack.of(scope);
    const id = `${stack.stackName}`;

    let dataPlatform: DataPlatform;

    if (stack.node.tryFindChild(id) == undefined && props != undefined) {
      dataPlatform = new DataPlatform(stack, id, props);
    } else if (stack.node.tryFindChild(id) == undefined && typeof (props) == 'undefined') {
      throw new Error('Dataplatform construct initialization requires the ARN for the EKS admin role ');
    }

    return stack.node.tryFindChild(id) as DataPlatform || dataPlatform!;
  }

  private readonly emrEks: EmrEksCluster;
  private readonly dataPlatformMapping: Map<string, DataPlatformNotebook>;

  //This is used to avoid failing a deployment due to having duplicate EMR VC namespace or EMR Studio Name
  // Used to keep track of names given to EMR Studio and EMR VC namespaces
  private emrVCNamespaceAndStudioNameList: string[] = [];


  private constructor(scope: Construct, id: string, props: DataPlatformProps) {
    super(scope, id);
    //Create new Amazon EKS cluster for Amazon EMR or get one already create for previous EMR on EKS cluster
    //This avoid creating a new cluster everytime an object is initialized

    this.emrEks = EmrEksCluster.getOrCreate(scope, props.eksAdminRoleArn, KubernetesVersion.V1_20, id);
    this.dataPlatformMapping = new Map<string, DataPlatformNotebook>();

  }

  /**
   * Method used to create a new EMR Virtual cluster and EMR Studio for the dataplatform
   * @access public
   * @param {DataPlatformNotebookProp} dataPlatformNotebookProps the DataPlatformNotebooks as defined in [properties]{@link DataPlatformNotebookProp}
   */
  public addNotebookPlatform (dataPlatformNotebookProps: DataPlatformNotebookProp) : void {

    if (!this.emrVCNamespaceAndStudioNameList.includes(dataPlatformNotebookProps.studioName) ||
        !this.emrVCNamespaceAndStudioNameList.includes(dataPlatformNotebookProps.emrVCNamespace) ) {

      let notebookPlatform = new DataPlatformNotebook(this, dataPlatformNotebookProps.studioName, {
        emrEks: this.emrEks,
        dataPlatformProps: dataPlatformNotebookProps,
        serviceToken: this.emrEks.managedEndpointProviderServiceToken,
      });

      this.emrVCNamespaceAndStudioNameList.push(dataPlatformNotebookProps.studioName);
      this.emrVCNamespaceAndStudioNameList.push(dataPlatformNotebookProps.emrVCNamespace);

      this.dataPlatformMapping.set(dataPlatformNotebookProps.studioName, notebookPlatform);

      new CfnOutput(this, `emrStudioUrl-${dataPlatformNotebookProps.studioName}`, {
        value: notebookPlatform.studioUrl,
      });
    } else {
      throw new Error(`A dataplatform with name ${dataPlatformNotebookProps.studioName} 
      or this namespace ${dataPlatformNotebookProps.emrVCNamespace} 
        already exists in stack, please choose another name`);
    }
  }

  /**
   * Method to add users, takes the name of the EMR Studio hosting the notebook infrastructure
   * and takes a list of userDefinition and will create a managed endpoints for each user
   * and create an IAM Policy and Role scoped to the list of managed endpoints it the user should have access to
   * @param {StudioUserDefinition []} userList list of users defined in [properties]{@link StudioUserDefinition}
   * @param {string} notebookPlatformName the name given to the EMR studio at its creation
   * @access public
   */
  public addUsersNotebookPlatform (notebookPlatformName: string, userList: StudioUserDefinition[] ): void {
    if (this.dataPlatformMapping.has(notebookPlatformName)) {
      this.dataPlatformMapping.get(notebookPlatformName)!.addUser(userList);
    }
  }

}
