export const headerKey = Symbol('header');
/**
 * Bind a single header to a single parameter.
 * It will also attempt to convert the header to primitive type such as Boolean or Number
 * if the parameter also has that type
 * @param header The name of the header to bind
 * @constructor
 */
export const Header = (header: string) => {
  return (prototype: any, methodName: string, index: number) => {
    const currentParams = Reflect.getOwnMetadata(headerKey, prototype, methodName) || {};
    const parameterTypes = Reflect.getMetadata('design:paramtypes', prototype, methodName);
    const parameterType = parameterTypes[index].name;
    currentParams[header] = { index, parameterType };
    Reflect.defineMetadata(headerKey, currentParams, prototype, methodName);
  };
};
