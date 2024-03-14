export const headersKey = Symbol('headers');
/**
 * Bind all headers to an object, such as a custom one, or a Record
 * @param prototype
 * @param methodName
 * @param index
 * @constructor
 */
export const Headers = (prototype: any, methodName: string, index: number) => {
  Reflect.defineMetadata(headersKey, index, prototype, methodName);
};
