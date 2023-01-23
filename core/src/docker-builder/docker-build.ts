import { Aws, CfnOutput, CustomResource, RemovalPolicy, Stack } from "aws-cdk-lib";
import { BuildSpec, ComputeType, LinuxBuildImage, Project } from "aws-cdk-lib/aws-codebuild";
import { Repository } from "aws-cdk-lib/aws-ecr";
import { PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { BucketEncryption } from "aws-cdk-lib/aws-s3";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import { Construct } from "constructs";
import { AraBucket } from "../ara-bucket";
import { EmrEksImageBuilderCRProviderSetup, emrOnEksImageMap } from "./docker-builder-util";


/**
 * The properties for initializing the construct to build custom EMR on EKS image
 */
export interface EmrEksImageBuilderProps {
  /**
   * Required
   * The name of the ECR repository to create
   * */
  readonly repositoryName: string;
  /**
   * @default RemovalPolicy.RETAIN
   * This option allow to delete or not the ECR repository
   * If it is set to RemovalPolicy.DESTROY, you need to delete the images before we delete the Repository 
   * */
  readonly ecrRemovalPolicy?: RemovalPolicy;
}

/**
 * A CDK construct to create build and publish EMR on EKS custom image 
 * The construct will create an ECR repository to publish the images 
 * It provide a method {@link publishImage} to build a docker file and publish it to the ECR repository 
 *
 * Resources deployed:
 *
 * * Multiple Session Policies that are used to map an EMR Studio user or group to a set of resources they are allowed to access. These resources are:
 *   * ECR Repository
 *   * Codebuild project
 *   * A custom resource to build and publish a custom EMR on EKS image 
 *
 *
 * Usage example:
 *
 * ```typescript
 * 
 * const app = new App();
 *   
 * const account = process.env.CDK_DEFAULT_ACCOUNT;
 * const region = process.env.CDK_DEFAULT_REGION;
 * 
 * const stack = new Stack(app, 'EmrEksImageBuilderStack', {
 * env: { account: account, region: region },
 * });
 * 
 * const publish = new EmrEksImageBuilder(stack, 'EmrEksImageBuilder', {
 *  repositoryName: 'my-repo',
 *  ecrRemovalPolicy: RemovalPolicy.RETAIN
 * });
 * 
 * publish.publishImage('PATH-TO-DOCKER-FILE-FOLDER', 'v4');
 *
 * ```
 */

export class EmrEksImageBuilder extends Construct {

  private readonly ecrURI: string;
  private readonly dockerBuildPublishCrToken: string;
  private readonly assetBucket: AraBucket;
  private readonly codebuildProjectName: string;
  private readonly ecrName: string;

  constructor(scope: Construct, id: string, props: EmrEksImageBuilderProps) {

    super(scope, id);

    this.assetBucket = AraBucket.getOrCreate(this, { bucketName: `${Stack.of(this).stackName}-ara-docker-assets`, encryption: BucketEncryption.KMS_MANAGED });

    let codeBuildRole = new Role(this, 'codebuildarn', {
      assumedBy: new ServicePrincipal('codebuild.amazonaws.com'),
    });

    const ecrRepo: Repository = new Repository(this, `ecr-${props.repositoryName}`, {
      repositoryName: props.repositoryName,
      removalPolicy: props.ecrRemovalPolicy ? props.ecrRemovalPolicy : RemovalPolicy.RETAIN,
      imageScanOnPush: true
    });

    this.ecrURI = ecrRepo.repositoryUri;
    this.ecrName = props.repositoryName;

    let dockerImageAccount: string | undefined = emrOnEksImageMap.get(Stack.of(this).region);

    if (dockerImageAccount === undefined)
      throw new Error('Docker Image is not available in the selected region');
      
    let commands = [
      'echo logging into docker',
      `aws ecr get-login-password --region ${Aws.REGION} | docker login --username AWS --password-stdin ${dockerImageAccount!}.dkr.ecr.${Aws.REGION}.amazonaws.com`,
      'echo Build start',
      'echo $DOCKER_FILE_S3_PATH',
      'aws s3 cp $DOCKER_FILE_S3_PATH Dockerfile',
      'docker build -t local .',
      'docker logout',
      'echo $ecrURI',
      `aws ecr get-login-password --region ${Aws.REGION} | docker login --username AWS --password-stdin ${this.ecrURI}`,
      'docker tag local $ecrURI:$tag',
      'docker push $ecrURI:$tag',
      'docker logout'
    ];

    const codebuildProject = new Project(this, `DockerImageDeployProject-${props.repositoryName}`, {
      buildSpec: BuildSpec.fromObject({
        version: '0.2',
        phases: {
          build: {
            commands: commands,
          },
        },
      }),
      environment: {
        privileged: true,
        buildImage: LinuxBuildImage.STANDARD_5_0,
        computeType: ComputeType.SMALL
      },
      role: codeBuildRole,
    });

    ecrRepo.grantPullPush(codeBuildRole);
    this.assetBucket.grantRead(codeBuildRole);

    codeBuildRole.addToPolicy(new PolicyStatement ({
      resources: [`arn:aws:ecr:${Aws.REGION}:${dockerImageAccount}:repository/*`],
      actions: [
        'ecr:BatchGetImage',
        'ecr:GetAuthorizationToken',
        'ecr:BatchCheckLayerAvailability',
        'ecr:GetDownloadUrlForLayer',
      ]
    }));

    this.codebuildProjectName = codebuildProject.projectName;

    this.dockerBuildPublishCrToken = EmrEksImageBuilderCRProviderSetup(this, codebuildProject.projectArn);
  }

  /**
   * A method to build and publish the custom image from a Dockerfile 
   * The method invoke the custom resource deployed by the construct 
   * and publish the **URI** of the published custom image as Cloudformation output  
   * @param {string} dockerfilePath Path to the folder for Dockerfile 
   * @param {string} tag The tag used to publish to the ECR repository
   */

  public publishImage(dockerfilePath: string, tag: string) {

    new BucketDeployment(this, `DockerfileAssetDeployment-${tag}`, {
      destinationBucket: this.assetBucket,
      destinationKeyPrefix: `${this.ecrName}/${tag}`,
      sources: [Source.asset(dockerfilePath)],
    });

    const containerImage =  new CustomResource(this, `EmrEksImageBuild-${tag}`, {
      serviceToken: this.dockerBuildPublishCrToken,
      properties: {
        s3Path: `s3://${this.assetBucket.bucketName}/${this.ecrName}/${tag}/Dockerfile`,
        tag: tag,
        ecrURI: this.ecrURI,
        codebuildProjectName: this.codebuildProjectName,
        ecrName: this.ecrName,
      },
    });

    new CfnOutput(this, `URI-${tag}`, {
      value: containerImage.getAttString('ContainerUri'),
    })

  }

}