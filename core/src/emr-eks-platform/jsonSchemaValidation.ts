/*
//THIS WILL WORK ONCE THE JSII TS 3.9 Dep IS FIXED
import Ajv from 'ajv';

//TO DO REMOVE THIS ONCE TESTING IS COMPLETE
import * as configOverrideSchema from './configOverrideJSONSchema.json';
import * as testOverride from './resources/k8s/emr-eks-config/notebook.json';

const ajv = new Ajv();

export function schemaValidation (schemaPath?: string, jsonObject?: string) {

  // @ts-ignore
  console.log (schemaPath + jsonObject);

  const schema = JSON.parse(JSON.stringify(configOverrideSchema));

  const data = JSON.parse(JSON.stringify(testOverride));

  const validate = ajv.compile(schema);

  const valid = validate(data);

  console.log(valid);

}
*/
