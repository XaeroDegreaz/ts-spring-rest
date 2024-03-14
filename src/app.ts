import "reflect-metadata";
import {headerKey} from "./decorators/Header";
import {headersKey} from "./decorators/Headers";
import {requestMappingKey, requestMappingTree, RequestMappingTree} from "./decorators/PostMapping";
import {requestBodyKey} from "./decorators/RequestBody";
import {requestParameterKey} from "./decorators/RequestParameter";
import {requestParametersKey} from "./decorators/RequestParameters";

export interface RequestMapping {
  path: string;
  accepts?: Array<string>
  produces?: Array<string>
}

interface Request {
  method: "GET" | "POST"
  path: string
  body?: string
  headers?: string
  requestParameters?: string
}

interface KeyData {
  index: number,
  parameterType: string
}

const joinMapParameters = ( keyData: Record<string, KeyData>, data: Record<string, any>, args: any[] ) => {
  Object.keys( keyData ).forEach( value => {
    let parameterValue = data[value];
    switch ( keyData[value].parameterType )
    {
      case 'Boolean':
      {
        parameterValue = Boolean( data[value] )
        break;
      }
      case 'Number':
      {
        parameterValue = Number( data[value] )
        break;
      }
    }
    args[keyData[value].index] = parameterValue
  } )
}

export const handlePayload = async ( request: Request, target: any ) => {
  const prototype = Object.getPrototypeOf( target )
  const mappings: RequestMappingTree | undefined = Reflect.getOwnMetadata( requestMappingKey, prototype, requestMappingTree );
  const foundPath = mappings?.[request.method]?.[request.path];
  if ( !foundPath )
  {
    console.log( "Path not registered" )
    return;//404
  }
  const {method, methodName} = foundPath;

  const args: any[] = [];
  //# Grab metadata keys
  const requestBodyParam = Reflect.getOwnMetadata( requestBodyKey, prototype, methodName );
  const headersParam = Reflect.getOwnMetadata( headersKey, prototype, methodName );
  const requestParametersParam = Reflect.getOwnMetadata( requestParametersKey, prototype, methodName );
  const requestParameterParam: Record<string, { index: number, parameterType: string }> = Reflect.getOwnMetadata( requestParameterKey, prototype, methodName );
  const headerParam: Record<string, { index: number, parameterType: string }> = Reflect.getOwnMetadata( headerKey, prototype, methodName );
  //# Parse headers / body
  const requestHeaders = request.headers ? JSON.parse( request.headers ) : undefined
  const requestParams = request.requestParameters ? JSON.parse( request.requestParameters ) : undefined

  //# Construct arguments
  args[requestBodyParam] = request.body ? JSON.parse( request.body ) : undefined
  args[headersParam] = requestHeaders
  args[requestParametersParam] = requestParams;
  //# For arguments that use the same decorators
  joinMapParameters( requestParameterParam, requestParams, args )
  joinMapParameters( headerParam, requestHeaders, args )

  //# Call the function with the arguments
  return await method.apply( target, args );
}