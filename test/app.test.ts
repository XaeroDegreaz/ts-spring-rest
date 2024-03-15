import 'reflect-metadata';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { Container, Singleton } from 'typescript-ioc';
import { AwsLambdaHandler } from '../src';
import { handleRequest } from '../src';
import { GetMapping, PostMapping } from '../src';
import { Headers } from '../src';
import { RequestBody } from '../src';
import { RequestParameters } from '../src';
import { RequestParameter } from '../src';
import { Header } from '../src';
import { ErrorHandler } from '../src/decorators/ExceptionHandler';
import * as awsEvent from './awsEvent.json';

class Pojo {
  str: string;
  num: number;
}

class Error1 extends Error {}

class Error2 extends Error {}

@Singleton
export class DecoratorClass {
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
  @ErrorHandler({ errorType: [Error1], statusCode: 500 })
  @ErrorHandler({ errorType: [Error2], statusCode: 400 })
  handleError() {
    console.log('handleError() - Test method invoked');
    throw new Error2('This is a test error for Error2');
  }
}

describe('run controller tests', () => {
  test('handle error', async () => {
    const output = await new AwsLambdaHandler(DecoratorClass)
      .withIocContainerGetMethod(Container.get)
      .handle({
        ...awsEvent,
        httpMethod: 'POST',
        path: '/test/handle-error',
        body: null,
      });
    expect(output).toEqual({ body: 'This is a test error for Error2', statusCode: 400 });
  });

  test('post happy path', async () => {
    const controller = new DecoratorClass();
    await handleRequest(
      {
        method: 'POST',
        path: '/test/post',
        body: '{"str": "test string", "int": 9001}',
        headers: {
          'post_content-type': 'application/json',
          'post_test-number-header': '15',
        },
        requestParameters: {
          post_param1: 'value1',
          post_param2: '2',
          post_param3: 'true',
        },
      },
      controller
    );
    expect(controller.requestBody).toEqual({ str: 'test string', int: 9001 });
    expect(controller.headers).toEqual({
      'post_content-type': 'application/json',
      'post_test-number-header': '15',
    });
    expect(controller.contentType).toEqual('application/json');
    expect(controller.testNumberHeader).toEqual(15);
    expect(controller.requestParameters).toEqual({
      post_param1: 'value1',
      post_param2: '2',
      post_param3: 'true',
    });
    expect(controller.param1).toEqual('value1');
    expect(controller.param2).toEqual(2);
    expect(controller.param3).toEqual(true);
    expect(controller.nothing).toBeUndefined();
    //# TODO -- figure out a good way to do path parameters
  });

  test('post no headers or request params happy path', async () => {
    const controller = new DecoratorClass();
    await handleRequest(
      {
        method: 'POST',
        path: '/test/post-no-headers-no-request-params',
        body: '{"str": "test string", "int": 9001}',
        headers: {
          'post_content-type': 'application/json',
          'post_test-number-header': '15',
        },
        requestParameters: {
          post_param1: 'value1',
          post_param2: '2',
          post_param3: 'true',
        },
      },
      controller
    );
    expect(controller.requestBody).toEqual({ str: 'test string', int: 9001 });
    expect(controller.headers).toEqual({
      'post_content-type': 'application/json',
      'post_test-number-header': '15',
    });
    expect(controller.contentType).toBeUndefined();
    expect(controller.testNumberHeader).toBeUndefined();
    expect(controller.requestParameters).toEqual({
      post_param1: 'value1',
      post_param2: '2',
      post_param3: 'true',
    });
    expect(controller.param1).toBeUndefined();
    expect(controller.param2).toBeUndefined();
    expect(controller.param3).toBeUndefined();
    expect(controller.nothing).toBeUndefined();
    //# TODO -- figure out a good way to do path parameters
  });

  test("ensure gets don't work on postmapping", async () => {
    const controller = new DecoratorClass();
    await handleRequest(
      {
        method: 'GET',
        path: '/test/post',
        body: '{"str": "test string", "int": 9001}',
        headers: {
          'post_content-type': 'application/json',
          'test-number-header': '15',
        },
        requestParameters: {
          post_param1: 'value1',
          param2: '2',
          post_param3: 'true',
        },
      },
      controller
    );
    expect(controller.requestBody).toBeUndefined();
    expect(controller.headers).toBeUndefined();
    expect(controller.contentType).toBeUndefined();
    expect(controller.testNumberHeader).toBeUndefined();
    expect(controller.requestParameters).toBeUndefined();
    expect(controller.param1).toBeUndefined();
    expect(controller.param2).toBeUndefined();
    expect(controller.param3).toBeUndefined();
    expect(controller.nothing).toBeUndefined();
    //# TODO -- figure out a good way to do path parameters
  });

  test('get happy path', async () => {
    const controller = new DecoratorClass();
    await handleRequest(
      {
        method: 'GET',
        path: '/test/get',
        body: '{"str": "test string", "int": 9001}',
        headers: {
          'get_content-type': 'application/json',
          'get_test-number-header': '15',
        },
        requestParameters: {
          get_param1: 'value1',
          get_param2: '2',
          get_param3: 'true',
        },
      },
      controller
    );
    expect(controller.headers).toEqual({
      'get_content-type': 'application/json',
      'get_test-number-header': '15',
    });
    expect(controller.contentType).toEqual('application/json');
    expect(controller.testNumberHeader).toEqual(15);
    expect(controller.requestParameters).toEqual({
      get_param1: 'value1',
      get_param2: '2',
      get_param3: 'true',
    });
    expect(controller.param1).toEqual('value1');
    expect(controller.param2).toEqual(2);
    expect(controller.param3).toEqual(true);
    expect(controller.nothing).toBeUndefined();
    //# TODO -- figure out a good way to do path parameters
  });

  test('aws handler with ioc container', async () => {
    const event: APIGatewayProxyEvent = {
      ...awsEvent,
      httpMethod: 'GET',
      path: '/test/get',
      body: '{"str": "test string", "int": 9001}',
      headers: {
        'get_content-type': 'application/json',
        'get_test-number-header': '15',
      },
      queryStringParameters: {
        get_param1: 'value1',
        get_param2: '2',
        get_param3: 'true',
      },
    };
    const controller = Container.get(DecoratorClass);
    await new AwsLambdaHandler(DecoratorClass)
      .withIocContainerGetMethod(Container.get)
      .handle(event);
    expect(controller.headers).toEqual({
      'get_content-type': 'application/json',
      'get_test-number-header': '15',
    });
    expect(controller.contentType).toEqual('application/json');
    expect(controller.testNumberHeader).toEqual(15);
    expect(controller.requestParameters).toEqual({
      get_param1: 'value1',
      get_param2: '2',
      get_param3: 'true',
    });
    expect(controller.param1).toEqual('value1');
    expect(controller.param2).toEqual(2);
    expect(controller.param3).toEqual(true);
    expect(controller.nothing).toBeUndefined();
  });

  test('aws handler without ioc container', async () => {
    const event: APIGatewayProxyEvent = {
      ...awsEvent,
      httpMethod: 'GET',
      path: '/test/get',
      body: '{"str": "test string", "int": 9001}',
      headers: {
        'get_content-type': 'application/json',
        'get_test-number-header': '15',
      },
      queryStringParameters: {
        get_param1: 'value1',
        get_param2: '2',
        get_param3: 'true',
      },
    };
    const controller = new DecoratorClass();
    await new AwsLambdaHandler(controller).handle(event);
    expect(controller.headers).toEqual({
      'get_content-type': 'application/json',
      'get_test-number-header': '15',
    });
    expect(controller.contentType).toEqual('application/json');
    expect(controller.testNumberHeader).toEqual(15);
    expect(controller.requestParameters).toEqual({
      get_param1: 'value1',
      get_param2: '2',
      get_param3: 'true',
    });
    expect(controller.param1).toEqual('value1');
    expect(controller.param2).toEqual(2);
    expect(controller.param3).toEqual(true);
    expect(controller.nothing).toBeUndefined();
  });
});
