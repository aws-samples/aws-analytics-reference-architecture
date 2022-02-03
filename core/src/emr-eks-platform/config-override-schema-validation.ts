import { validator } from '@exodus/schemasafe';

export function validateSchema (
  overrideConfigSchema: string,
  overrideConfigData: string | undefined): boolean | never {

  if (overrideConfigData !== undefined) {
    const schemaObject = JSON.parse(overrideConfigSchema);

    const data = JSON.parse(overrideConfigData);

    const validate = validator(schemaObject);

    if (validate(data)) {
      return true;
    } else {
      throw new Error(`The configuration override is not valid JSON : ${overrideConfigData}`);
    }
  } else {
    return false;
  }
}


