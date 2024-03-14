interface RequestMapping {
  path: string;
  accepts?: Array<string>;
  produces?: Array<string>;
}

/**
 * This interface serves as a way to keep track of all the
 * path mappings for a given HTTP verb
 */
export interface RequestMappingTree {
  [httpMethod: string]: {
    [path: string]: {
      method: Function;
      methodName: string;
    };
  };
}

export const requestMappingTree = 'requestMappingTree';
export const requestMappingKey = Symbol('requestMapping');

export const PostMapping = (mapping: RequestMapping) => {
  return (prototype: any, methodName: string, descriptor: PropertyDescriptor) => {
    createMapping('POST', mapping, prototype, methodName, descriptor);
  };
};

export const GetMapping = (mapping: RequestMapping) => {
  return (prototype: any, methodName: string, descriptor: PropertyDescriptor) => {
    createMapping('GET', mapping, prototype, methodName, descriptor);
  };
};

export const PutMapping = (mapping: RequestMapping) => {
  return (prototype: any, methodName: string, descriptor: PropertyDescriptor) => {
    createMapping('PUT', mapping, prototype, methodName, descriptor);
  };
};

export const PatchMapping = (mapping: RequestMapping) => {
  return (prototype: any, methodName: string, descriptor: PropertyDescriptor) => {
    createMapping('PATCH', mapping, prototype, methodName, descriptor);
  };
};

export const DeleteMapping = (mapping: RequestMapping) => {
  return (prototype: any, methodName: string, descriptor: PropertyDescriptor) => {
    createMapping('DELETE', mapping, prototype, methodName, descriptor);
  };
};

/**
 * Add mapping metadata for a given HTTP verb, and a path
 * @param httpMethod
 * @param mapping
 * @param prototype
 * @param methodName
 * @param descriptor
 */
const createMapping = (
  httpMethod: string,
  mapping: RequestMapping,
  prototype: any,
  methodName: string,
  descriptor: PropertyDescriptor
) => {
  let currentParams: RequestMappingTree = Reflect.getOwnMetadata(
    requestMappingKey,
    prototype,
    requestMappingTree
  ) || { [httpMethod]: {} };
  if (!currentParams[httpMethod]) {
    currentParams[httpMethod] = {
      [mapping.path]: { method: descriptor.value, methodName },
    };
  } else {
    currentParams[httpMethod][mapping.path] = {
      method: descriptor.value,
      methodName,
    };
  }
  Reflect.defineMetadata(requestMappingKey, currentParams, prototype, requestMappingTree);
};
