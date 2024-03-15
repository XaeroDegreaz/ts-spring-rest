import 'reflect-metadata';
import { headerKey } from './decorators/Header';
import { headersKey } from './decorators/Headers';
import {
  requestMappingKey,
  requestMappingTree,
  RequestMappingTree,
} from './decorators/PostMapping';
import { requestBodyKey } from './decorators/RequestBody';
import { requestParameterKey } from './decorators/RequestParameter';
import { requestParametersKey } from './decorators/RequestParameters';

/**
 * HTTP request information
 */
interface Request {
  method: string;
  path: string;
  body?: string;
  headers?: Record<string, string>;
  requestParameters?: Record<string, string>;
}

/**
 * Maps method parameter indexes to their design-time types
 */
interface KeyData {
  index: number;
  parameterType: string;
}

/**
 * Internal function that handles HTTP request information, and searches decorator metadata in
 * order to find appropriate methods for routing, and binding of data to decorated parameters
 * @param request The request object
 * @param target The constructed class to be used when scanning decorator metadata
 */
export const handleRequest = async (request: Request, target: any) => {
  const prototype = Object.getPrototypeOf(target);
  const mappings: RequestMappingTree | undefined = Reflect.getOwnMetadata(
    requestMappingKey,
    prototype,
    requestMappingTree
  );
  const foundPath = mappings?.[request.method]?.[request.path];
  if (!foundPath) {
    console.log('Path not registered');
    return; //404
  }
  const { method, methodName } = foundPath;

  const args: any[] = [];
  //# Grab metadata keys
  const requestBodyParam = Reflect.getOwnMetadata(requestBodyKey, prototype, methodName);
  const headersParam = Reflect.getOwnMetadata(headersKey, prototype, methodName);
  const requestParametersParam = Reflect.getOwnMetadata(
    requestParametersKey,
    prototype,
    methodName
  );
  const requestParameterParam: Record<string, KeyData> | undefined = Reflect.getOwnMetadata(
    requestParameterKey,
    prototype,
    methodName
  );
  const headerParam: Record<string, KeyData> | undefined = Reflect.getOwnMetadata(
    headerKey,
    prototype,
    methodName
  );
  //# Parse headers / body
  const requestHeaders = request.headers;
  const requestParams = request.requestParameters;

  //# Construct arguments
  args[requestBodyParam] = request.body ? JSON.parse(request.body) : undefined;
  args[headersParam] = requestHeaders;
  args[requestParametersParam] = requestParams;
  //# For arguments that use the same decorators
  joinMapParameters(requestParameterParam, requestParams, args);
  joinMapParameters(headerParam, requestHeaders, args);

  //# Call the function with the arguments
  try {
    const output = await method.apply(target, args);
    //# @ErrorHandler will "return" an Error instead of throwing it inside the decorator.
    //# Thrown errors there do not propagate inside user-code, so forcing the function
    //# to return the error, and checking for it here to rethrow seems like the best solution.
    if (output instanceof Error) {
      throw output;
    }
    return output;
  } finally {
    //# Nothing -- we don't wanna handle errors here. Let it bubble and get handled in a Handler method somewhere.
  }
};

/**
 * Some decorators may be used by more than one parameter, such as @RequestParameter.
 * This function maps string keys to parameter indexes, and uses the key to assign the correct
 * value from the data record to the argument array
 * @param keyData The key data which maps a key, to a parameter index, and parameter type
 * @param data A data map containing key-value-pairs
 * @param args The current state of the argument array
 */
const joinMapParameters = (
  keyData: Record<string, KeyData> | undefined,
  data: Record<string, any> | undefined,
  args: any[]
) => {
  if (!data) {
    //# TODO - Test for this
    return;
  }
  if (!keyData) {
    return;
  }
  Object.keys(keyData).forEach((value) => {
    let parameterValue = data[value];
    switch (keyData[value].parameterType) {
      case 'Boolean': {
        parameterValue = Boolean(data[value]);
        break;
      }
      case 'Number': {
        parameterValue = Number(data[value]);
        break;
      }
    }
    args[keyData[value].index] = parameterValue;
  });
};
