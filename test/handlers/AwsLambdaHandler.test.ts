import 'reflect-metadata';
import { AwsLambdaHandler } from '../../src';
import { Container } from 'typescript-ioc';
import * as awsEvent from '../awsEvent.json';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { TestController } from '../TestController';

describe('AwsLambdaHandler tests', () => {
  test('can handle @ErrorHandler errors', async () => {
    const output = await new AwsLambdaHandler(TestController)
      .withIocContainerGetMethod(Container.get)
      .handle({
        ...awsEvent,
        httpMethod: 'POST',
        path: '/test/handle-error',
        body: null,
      });
    expect(output).toEqual({ body: 'This is a test error for Error2', statusCode: 400 });
  });

  test('aws handler using IOC container', async () => {
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
    const controller = Container.get(TestController);
    await new AwsLambdaHandler(TestController)
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

  test('aws handler without IOC container', async () => {
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
    const controller = new TestController();
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
