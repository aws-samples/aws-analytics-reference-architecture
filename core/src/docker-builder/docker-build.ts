import { Aws, CfnOutput, CustomResource, RemovalPolicy, Stack } from "aws-cdk-lib";
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
  private readonly ecrName: string;

  constructor(scope: Construct, id: string, props: DockerBuilderProps) {

    super(scope, id);

    this.assetBucket = AraBucket.getOrCreate(this, { bucketName: `${Stack.of(this).stackName}-ara-docker-assets`, encryption: BucketEncryption.KMS_MANAGED });

    let codeBuildRole = new Role(this, 'codebuildarn', {
      assumedBy: new ServicePrincipal('codebuild.amazonaws.com'),
    });

    const ecrRepo: Repository = new Repository(this, `ecr-${props.repositoryName}`, {
      repositoryName: props.repositoryName,
      removalPolicy: RemovalPolicy.DESTROY,
      imageScanOnPush: true
    });

    this.ecrURI = ecrRepo.repositoryUri;
    this.ecrName = props.repositoryName;

    let commands = [
      'echo logging into docker',
      `aws ecr get-login-password --region ${Aws.REGION} | docker login --username AWS --password-stdin ${this.ecrURI}`,
      'echo Build start',
      'echo $ecrURI',
      'echo $DOCKER_FILE_S3_PATH',
      'aws s3 cp $DOCKER_FILE_S3_PATH Dockerfile',
      'docker build -t local .',
      'docker tag local $ecrURI:$tag',
      'docker push $ecrURI:$tag',
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
    this.assetBucket.grantRead(codeBuildRole);

    this.codebuildProjectName = codebuildProject.projectName;

    console.log(ecrRepo.repositoryName);

    this.dockerBuildPublishCrToken = CustomResourceProviderSetup(this, codebuildProject.projectArn);
  }

  public publishImage(dockerfilePath: string, tag: string) {

    new BucketDeployment(this, `DockerfileAssetDeployment`, {
      destinationBucket: this.assetBucket,
      destinationKeyPrefix: `${this.ecrName}/${tag}`,
      sources: [Source.asset(dockerfilePath)],
    });

    const containerImage =  new CustomResource(this, 'testCR', {
      serviceToken: this.dockerBuildPublishCrToken,
      properties: {
        s3Path: `s3://${this.assetBucket.bucketName}/${this.ecrName}/${tag}/Dockerfile`,
        tag: tag,
        ecrURI: this.ecrURI,
        codebuildProjectName: this.codebuildProjectName,
      },
    });

    new CfnOutput(this, 'URI', {
      value: containerImage.getAttString('ContainerUri'),
    })

  }

}