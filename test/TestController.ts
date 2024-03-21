import { Singleton } from 'typescript-ioc';
import {
  ExceptionHandler,
  GetMapping,
  Header,
  Headers,
  PostMapping,
  RequestBody,
  RequestParameter,
  RequestParameters,
} from '../src';

class Error1 extends Error {}

class Error2 extends Error {}

class Pojo {
  str: string;
  num: number;
}

@Singleton
export class TestController {
  requestBody: Pojo;
  nothing: string;
  headers: Record<string, string>;
  requestParameters: Record<string, string>;
  param1: string;
  param2: number;
  param3: boolean;
  contentType: string;
  testNumberHeader: number;
  requestMappingTree: object;

  @PostMapping({ path: '/test/post' })
  postMapping(
    nothing: string,
    @RequestBody requestBody: Pojo,
    @Headers headers: Record<string, string>,
    @RequestParameters requestParameters: Record<string, string>,
    @RequestParameter('post_param1') param1: string,
    @RequestParameter('post_param2') param2: number,
    @RequestParameter('post_param3') param3: boolean,
    @Header('post_content-type') contentType: string,
    @Header('post_test-number-header') testNumberHeader: number
  ) {
    this.requestBody = requestBody;
    this.nothing = nothing;
    this.headers = headers;
    this.requestParameters = requestParameters;
    this.param1 = param1;
    this.param2 = param2;
    this.param3 = param3;
    this.contentType = contentType;
    this.testNumberHeader = testNumberHeader;
    return this;
  }

  @PostMapping({ path: '/test/post-no-headers-no-request-params' })
  postMappingNoHeadersNoPostParams(
    nothing: string,
    @RequestBody requestBody: Pojo,
    @Headers headers: Record<string, string>,
    @RequestParameters requestParameters: Record<string, string>
  ) {
    this.requestBody = requestBody;
    this.nothing = nothing;
    this.headers = headers;
    this.requestParameters = requestParameters;
    return this;
  }

  @GetMapping({ path: '/test/get' })
  getMapping(
    @Headers headers: Record<string, string>,
    @RequestParameters requestParameters: Record<string, string>,
    @RequestParameter('get_param1') param1: string,
    @RequestParameter('get_param2') param2: number,
    @RequestParameter('get_param3') param3: boolean,
    @Header('get_content-type') contentType: string,
    @Header('get_test-number-header') testNumberHeader: number
  ) {
    this.headers = headers;
    this.requestParameters = requestParameters;
    this.param1 = param1;
    this.param2 = param2;
    this.param3 = param3;
    this.contentType = contentType;
    this.testNumberHeader = testNumberHeader;
    return this;
  }

  @PostMapping({ path: '/test/handle-error' })
  @ExceptionHandler({ errorType: [Error1], statusCode: 500 })
  @ExceptionHandler({ errorType: [Error2], statusCode: 400 })
  handleError() {
    console.debug('handleError() - Test method invoked');
    throw new Error2('This is a test error for Error2');
  }
}
