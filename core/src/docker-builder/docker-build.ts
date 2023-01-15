import { BuildSpec, LinuxBuildImage, Project } from "aws-cdk-lib/aws-codebuild";
import { Repository } from "aws-cdk-lib/aws-ecr";
import { Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { stringList } from "aws-sdk/clients/datapipeline";
import { Construct } from "constructs";

export interface DockerBuilderProps {
  readonly repositoryName: string;
}

export class DockerBuilder extends Construct {

    private readonly ecrUI : string;

    constructor (scope: Construct, id: string, props: DockerBuilderProps) {

        super (scope, id); 

        let codeBuildRole = new Role(this, 'codebuildarn', {
            assumedBy: new ServicePrincipal('codebuild.amazonaws.com'),
        });

        const ecrRepo: Repository = new Repository(this, `ecr-${props.repositoryName}`, {
            repositoryName: props.repositoryName
        });
        
        this.ecrUI = ecrRepo.repositoryUri;

        let commands = [
            'echo logging into docker',
            '$(aws ecr get-login --no-include-email --region $AWS_DEFAULT_REGION)',
            'echo Build start',
            'docker logout'
            ];

        new Project(this, 'DockerImageDeployProject', {
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

        console.log(ecrRepo.repositoryName);
    }

    public publishImage (dockerfilePath: string) {

    }
  
}