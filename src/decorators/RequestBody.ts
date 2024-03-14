export const requestBodyKey = Symbol('requestBody');
export const RequestBody = (
  prototype: any,
  methodName: string,
  index: number,
) => {
  Reflect.defineMetadata(requestBodyKey, index, prototype, methodName);
};
