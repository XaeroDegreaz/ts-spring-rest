export const requestBodyKey = Symbol('requestBody');
/**
 * Bind the request body to a suitable object of your choice
 * @param prototype
 * @param methodName
 * @param index
 * @constructor
 */
export const RequestBody = (prototype: any, methodName: string, index: number) => {
  Reflect.defineMetadata(requestBodyKey, index, prototype, methodName);
};
