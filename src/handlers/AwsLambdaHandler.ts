import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Handler } from './Handler';
import { handleRequest } from '../requestHandler';

/**
 * A handler that understands AWS Lambda events, and can translate them, and pass them to
 * the internal handleRequest function
 */
export class AwsLambdaHandler extends Handler {
  async handle(request: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
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
      statusCode: 200,
    };
  }
}
