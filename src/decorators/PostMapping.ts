import { RequestMapping } from '../app';

export interface RequestMappingTree {
  [method: string]: {
    [path: string]: {
      method: Function;
      methodName: string;
    };
  };
}

export const requestMappingTree = 'requestMappingTree';
export const requestMappingKey = Symbol('requestMapping');

const createMapping = (
  httpMethod: string,
  mapping: RequestMapping,
  prototype: any,
  methodName: string,
  descriptor: PropertyDescriptor,
) => {
  let currentParams: RequestMappingTree = Reflect.getOwnMetadata(
    requestMappingKey,
    prototype,
    requestMappingTree,
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
  Reflect.defineMetadata(
    requestMappingKey,
    currentParams,
    prototype,
    requestMappingTree,
  );
};

export const PostMapping = (mapping: RequestMapping) => {
  return (
    prototype: any,
    methodName: string,
    descriptor: PropertyDescriptor,
  ) => {
    createMapping('POST', mapping, prototype, methodName, descriptor);
  };
};

export const GetMapping = (mapping: RequestMapping) => {
  return (
    prototype: any,
    methodName: string,
    descriptor: PropertyDescriptor,
  ) => {
    createMapping('GET', mapping, prototype, methodName, descriptor);
  };
};

export const PutMapping = (mapping: RequestMapping) => {
  return (
    prototype: any,
    methodName: string,
    descriptor: PropertyDescriptor,
  ) => {
    createMapping('PUT', mapping, prototype, methodName, descriptor);
  };
};

export const PatchMapping = (mapping: RequestMapping) => {
  return (
    prototype: any,
    methodName: string,
    descriptor: PropertyDescriptor,
  ) => {
    createMapping('PATCH', mapping, prototype, methodName, descriptor);
  };
};

export const DeleteMapping = (mapping: RequestMapping) => {
  return (
    prototype: any,
    methodName: string,
    descriptor: PropertyDescriptor,
  ) => {
    createMapping('DELETE', mapping, prototype, methodName, descriptor);
  };
};
