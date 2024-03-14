export const requestParametersKey = Symbol('requestParameters');
/**
 * Bind all request parameters (from the querystring) to a suitable object of your choice
 * @param prototype
 * @param methodName
 * @param index
 * @constructor
 */
export const RequestParameters = (prototype: any, methodName: string, index: number) => {
  Reflect.defineMetadata(requestParametersKey, index, prototype, methodName);
};
