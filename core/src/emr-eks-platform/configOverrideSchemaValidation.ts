
//THIS WILL WORK ONCE THE JSII TS 3.9 Dep IS FIXED
import { validator } from '@exodus/schemasafe';

//TO DO REMOVE THIS ONCE TESTING IS COMPLETE
//import * as configOverrideSchema from './resources/k8s/emr-eks-config/configOverrideJSONSchema.json';
//import * as testOverride from './resources/k8s/emr-eks-config/notebook.json';

export function schemaValidation (jsonSchemaString: string, jsonDataString: string): string | never {

  const schemaObject = JSON.parse(jsonSchemaString);

  const data = JSON.parse(jsonDataString);

  const validate = validator(schemaObject);

  if (validate(data)) {
    return jsonDataString;
  } else {
    throw new Error(`The configuration override is not valid JSON : ${jsonDataString}`);
  }

}


