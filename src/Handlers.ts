import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { handleRequest } from './requestHandler';

/**
 * A generic handler class. Should have a vendor-specific implementation somewhere
 */
export abstract class GenericHandler {
  protected constructor(protected iocContainerGetMethod?: Function) {}

  /**
   * Use AWS Lambda handler
   */
  static initWithAwsLambda() {
    return new AwsLambdaHandler();
  }

  /**
   * Using an inversion-of-control container, such as tsyringe, or typescript-ioc is supported
   * for constructing controller objects.
   * @param iocContainerGetMethod
   */
  withIocContainerGetMethod(iocContainerGetMethod: Function) {
    this.iocContainerGetMethod = iocContainerGetMethod;
    return this;
  }

  abstract handle(...args: any[]): any;
}

/**
 * A handler that understands AWS Lambda events, and can translate them, and pass them to
 * the internal handleRequest function
 */
export class AwsLambdaHandler extends GenericHandler {
  async handle(request: APIGatewayProxyEvent, controller: any): Promise<APIGatewayProxyResult> {
    const result = await handleRequest(
      {
        method: request.httpMethod,
        body: request.body as string | undefined,
        path: request.path,
        headers: request.headers as Record<string, string>,
        requestParameters: request.queryStringParameters as Record<string, string>,
      },
      this.iocContainerGetMethod?.(controller) || controller
    );
    return {
      body: JSON.stringify(result),
      statusCode: 200,
    };
  }
}
