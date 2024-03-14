export const requestParametersKey = Symbol( "requestParameters" )
export const RequestParameters = ( prototype: any, methodName: string, index: number ) => {
  Reflect.defineMetadata( requestParametersKey, index, prototype, methodName );
}
