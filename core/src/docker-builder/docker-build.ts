import { CustomResource, RemovalPolicy } from "aws-cdk-lib";
import { BuildSpec, LinuxBuildImage, Project } from "aws-cdk-lib/aws-codebuild";
import { Repository } from "aws-cdk-lib/aws-ecr";
import { Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { BucketEncryption } from "aws-cdk-lib/aws-s3";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import { Construct } from "constructs";
import { AraBucket } from "../ara-bucket";
import { CustomResourceProviderSetup } from "./docker-builder-util";

export interface DockerBuilderProps {
  readonly repositoryName: string;
}

export class DockerBuilder extends Construct {

  private readonly ecrURI: string;
  private readonly dockerBuildPublishCrToken: string;
  private readonly assetBucket: AraBucket;
  private readonly codebuildProjectName: string;

  constructor(scope: Construct, id: string, props: DockerBuilderProps) {

    super(scope, id);

    this.assetBucket = AraBucket.getOrCreate(this, { bucketName: 'docker-builder-assets', encryption: BucketEncryption.KMS_MANAGED });

    let codeBuildRole = new Role(this, 'codebuildarn', {
      assumedBy: new ServicePrincipal('codebuild.amazonaws.com'),
    });

    const ecrRepo: Repository = new Repository(this, `ecr-${props.repositoryName}`, {
      repositoryName: props.repositoryName,
      removalPolicy: RemovalPolicy.DESTROY,
      imageScanOnPush: true
    });

    this.ecrURI = ecrRepo.repositoryUri;

    let commands = [
      'echo logging into docker',
      'aws ecr get-login-password --region eu-west-1 | docker login --username AWS --password-stdin 372775283473.dkr.ecr.eu-west-1.amazonaws.com',
      'echo Build start',
      'echo $ecrURI',
      'echo $DOCKER_FILE_S3_PATH',
      'aws s3 cp $DOCKER_FILE_S3_PATH Dockerfile',
      'docker logout'
    ];

    const codebuildProject = new Project(this, 'DockerImageDeployProject', {
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
      },
      role: codeBuildRole,
    });

    ecrRepo.grantPullPush(codeBuildRole);

    this.codebuildProjectName = codebuildProject.projectName;

    console.log(ecrRepo.repositoryName);

    this.dockerBuildPublishCrToken = CustomResourceProviderSetup(this, codebuildProject.projectArn);
  }

  public publishImage(dockerfilePath: string) {

    new BucketDeployment(this, `DockerfileAssetDeployment`, {
      destinationBucket: this.assetBucket,
      destinationKeyPrefix: `myDockerFile`,
      sources: [Source.asset(dockerfilePath)],
    });

    new CustomResource(this, 'testCR', {
      serviceToken: this.dockerBuildPublishCrToken,
      properties: {
        s3Path: `s3://${this.assetBucket.bucketName}/myDockerFile/Dockerfile`,
        tag: 'v1',
        ecrURI: this.ecrURI,
        codebuildProjectName: this.codebuildProjectName,
      },
    });

  }

}