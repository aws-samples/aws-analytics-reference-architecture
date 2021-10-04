export function stringSanitizer (toSanitize: string ): string {

  return toSanitize.toLowerCase().replace(/[^\w\s]/gi, '');
}

export function managedEndpointCharacterLimit (managedEndpointName: string ): boolean {
  if (managedEndpointName.length < 64) {
    return true;
  }

  return false;
}

//This function check if the AWS SSO and region where the deployment to be done are the same
//Return false if they are not the same and the deployment fails safely
export function awsSSOAndRegionCheck () {

}
