export const requestParameterKey = Symbol( "requestParameter" )
export const RequestParameter = ( parameter: string ) => {
  return ( prototype: any, methodName: string, index: number ) => {
    const currentParams = Reflect.getOwnMetadata( requestParameterKey, prototype, methodName ) || {}
    const parameterTypes = Reflect.getMetadata( "design:paramtypes", prototype, methodName );
    const parameterType = parameterTypes[index].name
    currentParams[parameter] = {index, parameterType};
    Reflect.defineMetadata( requestParameterKey, currentParams, prototype, methodName );
  }
}
