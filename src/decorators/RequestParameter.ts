export const requestParameterKey = Symbol('requestParameter');
/**
 * Bind a single request parameter (from a querystring) to a method parameter.
 * It will also attempt to convert the parameter to primitive type such as Boolean or Number
 * if the parameter also has that type
 * @param parameter
 * @constructor
 */
export const RequestParameter = (parameter: string) => {
  return (prototype: any, methodName: string, index: number) => {
    const currentParams = Reflect.getOwnMetadata(requestParameterKey, prototype, methodName) || {};
    const parameterTypes = Reflect.getMetadata('design:paramtypes', prototype, methodName);
    const parameterType = parameterTypes[index].name;
    currentParams[parameter] = { index, parameterType };
    Reflect.defineMetadata(requestParameterKey, currentParams, prototype, methodName);
  };
};
