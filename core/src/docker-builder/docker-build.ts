import { BuildSpec, PipelineProject } from "aws-cdk-lib/aws-codebuild";
import { Repository } from "aws-cdk-lib/aws-ecr";
import { Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";

export interface DockerBuilderProps {

    readonly repositoryArn: string;

    readonly repositoryName: string;
}

export class DockerBuilder extends Construct {
    constructor (scope: Construct, id: string, props: DockerBuilderProps) {

        super (scope, id);

        let codeBuildRole = new Role(this, '', {
            assumedBy: new ServicePrincipal('codebuild.amazonaws.com'),
        });

        const ecrRepo: Repository = new Repository(this, '', {
            repositoryName: props.repositoryName
        });

        const buildPipeline: PipelineProject = new PipelineProject(this, '', {
            buildSpec: BuildSpec.fromSourceFilename('./buildspec-docker-build.yaml'),
            environment: {
                privileged: true,
            },
            role: codeBuildRole,
        });
    }
}