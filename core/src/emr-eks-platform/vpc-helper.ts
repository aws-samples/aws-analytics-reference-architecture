import { GatewayVpcEndpointAwsService, IpAddresses, SubnetType, Vpc } from 'aws-cdk-lib/aws-ec2';
import { Tags } from 'aws-cdk-lib';
import { Construct } from 'constructs';


/**
 * @internal
 * Upload podTemplates to the Amazon S3 location used by the cluster.
 * @param {Construct} scope The local path of the yaml podTemplate files to upload
 * @param {string} vpcCidr The cidr for vpc
 * @param {string} eksClusterName The name used to tag the subnet and vpc
 */

export function vpcBootstrap(scope: Construct , vpcCidr: string, eksClusterName: string) : Vpc {

    const vpcMask = parseInt(vpcCidr.split('/')[1]);

    // Calculate subnet masks based on VPC's mask
    const publicSubnetMask = vpcMask + 4;
    const privateSubnetMask = publicSubnetMask + 2; // twice as large as public subnet

    const vpc = new Vpc(scope, 'MyVPC', {
      ipAddresses: IpAddresses.cidr(vpcCidr),
      maxAzs: 3,
      natGateways: 3,
      subnetConfiguration: [
        {
          cidrMask: publicSubnetMask,
          name: 'Public',
          subnetType: SubnetType.PUBLIC,
        },
        {
          cidrMask: privateSubnetMask,
          name: 'Private',
          subnetType: SubnetType.PRIVATE_WITH_EGRESS,
        },
      ],
    });

    // Create a gateway endpoint for S3
    vpc.addGatewayEndpoint('S3Endpoint', {
      service: GatewayVpcEndpointAwsService.S3,
    });

    // Add tags to subnets
    for (let subnet of [...vpc.publicSubnets, ...vpc.privateSubnets]) {
      Tags.of(subnet).add('karpenter.sh/discovery', eksClusterName);
    }
    
    // Add tags to vpc
    Tags.of(vpc).add('karpenter.sh/discovery', eksClusterName);

    return vpc;
  }

