export const headerKey = Symbol('header');
export const Header = (parameter: string) => {
  return (prototype: any, methodName: string, index: number) => {
    const currentParams =
      Reflect.getOwnMetadata(headerKey, prototype, methodName) || {};
    const parameterTypes = Reflect.getMetadata(
      'design:paramtypes',
      prototype,
      methodName,
    );
    const parameterType = parameterTypes[index].name;
    currentParams[parameter] = { index, parameterType };
    Reflect.defineMetadata(headerKey, currentParams, prototype, methodName);
  };
};
