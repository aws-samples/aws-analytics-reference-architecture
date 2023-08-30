import { sendRequest } from './helpers';

type Event = {
  RequestType: string;
  ResourceProperties: {
    endpoint: string;
    accessRolesArns: string[];
    adminSecretArn: string;
  };
};
export async function handler(event: Event): Promise<any> {
  switch (event.RequestType) {
    case 'Create':
    case 'Update':
      await onUpdate(event);
      break;
    case 'Delete':
      break;
    default:
      throw new Error(`invalid request type: ${event.RequestType}`);
  }
}

const onUpdate = async (event: Event) => {
  const { accessRolesArns } = event.ResourceProperties;

  for (const accessRoleArn of accessRolesArns) {
    await createRole(accessRoleArn);
    await mapRole(accessRoleArn);
  }
};

async function mapRole(roleArn: string) {
  const name = roleArn.split(':').pop()?.split('/').pop();
  await sendRequest({
    method: 'PUT',
    path: '_plugins/_security/api/rolesmapping/' + name,
    body: { backend_roles: [roleArn] },
  });
}

async function createRole(roleArn: string) {
  const name = roleArn.split(':').pop()?.split('/').pop();
  console.log('creating role ' + roleArn);
  try {
    await sendRequest({
      method: 'PUT',
      path: '_opendistro/_security/api/roles/' + name,
      body: {
        cluster_permissions: ['cluster_composite_ops', 'cluster_monitor'],
        index_permissions: [
          {
            index_patterns: ['*'],
            allowed_actions: ['crud', 'create_index', 'manage'],
          },
        ],
      },
    });
    console.log('successfully created role ' + roleArn);
  } catch (error) {
    console.error(error);
  }
}
