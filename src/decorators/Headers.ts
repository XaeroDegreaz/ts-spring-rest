export const headersKey = Symbol('headers');
export const Headers = (prototype: any, methodName: string, index: number) => {
  Reflect.defineMetadata(headersKey, index, prototype, methodName);
};
