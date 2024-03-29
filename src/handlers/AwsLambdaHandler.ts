import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DecoratedMethodException } from '../decorators/ExceptionHandler';
import { Handler } from './Handler';
import { handleRequest } from '../requestHandler';

/**
 * A handler that understands AWS Lambda events, and can translate them, and pass them to
 * the internal handleRequest function
 */
export class AwsLambdaHandler extends Handler {
  async handle(
    request: APIGatewayProxyEvent,
    bubbleExceptions = false,
    logExceptions = true
  ): Promise<APIGatewayProxyResult> {
    try {
      const result = await handleRequest(
        {
          method: request.httpMethod,
          body: request.body as string | undefined,
          path: request.path,
          headers: request.headers as Record<string, string>,
          requestParameters: request.queryStringParameters as Record<string, string>,
        },
        this.controller
      );
      return {
        body: JSON.stringify(result),
        statusCode: 200, //# make this dynamically grabbed from the handler
      };
    } catch (e) {
      logExceptions
        ? e instanceof DecoratedMethodException
          ? console.error(e.e)
          : console.error(e)
        : undefined;
      if (bubbleExceptions) {
        if (e instanceof DecoratedMethodException) {
          throw e.e;
        }
        throw e;
      } else {
        if (e instanceof DecoratedMethodException) {
          return {
            body: e.message,
            statusCode: e.statusCode,
          };
        } else {
          return {
            body: e.message,
            statusCode: 500,
          };
        }
      }
    }
  }
}
