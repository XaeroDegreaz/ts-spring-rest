import 'reflect-metadata';
import { DecoratedMethodException, handleRequest } from '../src';
import { TestController } from './TestController';

describe('run controller tests', () => {
  test('post happy path', async () => {
    const controller = new TestController();
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
    const controller = new TestController();
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
    const controller = new TestController();
    const func = async () => {
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
    };
    await expect(func).rejects.toThrow(
      new DecoratedMethodException(new Error("Path 'GET => /test/post' not registered."), 404)
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
    const controller = new TestController();
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
});
