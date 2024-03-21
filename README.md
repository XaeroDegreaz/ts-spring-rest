# Request Handling in TypeScript

This README provides instructions on how to use various decorators, Handler implementations, and the `handleRequest` function in TypeScript to handle HTTP requests effectively.

## Decorators

### `@PostMapping`

- **Description**: Binds a method to handle POST requests at a specific path.

```typescript
import { PostMapping } from '@xaerodegreaz/ts-spring-rest';

class ExampleController {
  @PostMapping( { path: '/example' } )
  handlePostRequest()
  {
    // Handle POST request logic
  }
}
```
There are decorators for `@GetMapping`, `@DeleteMapping`, etc.

### `@RequestBody`

- **Description**: Binds the request body to a suitable object of your choice.

```typescript
import { RequestBody } from '@xaerodegreaz/ts-spring-rest';

class MyObject {
  name: string
  age: number
}

class ExampleController {
  @PostMapping( { path: '/example' } )
  handlePostRequest( @RequestBody body: MyObject )
  {
    // Use request body
  }
}
```

### `@RequestParameter`

- **Description**: Binds a single request parameter (from a query string) to a method parameter  and attempts to convert it to a primitive type if possible. 

```typescript
import { RequestParameter } from '@xaerodegreaz/ts-spring-rest';

class ExampleController {
  @GetMapping( { path: '/example' } )
  handleGetRequest( @RequestParameter( 'id' ) id: number )
  {
    // Use request parameter
  }
}
```

### `@RequestParameters`

- **Description**: Binds all request parameters (from the query string) to a suitable object of your choice.

```typescript
import { RequestParameters } from '@xaerodegreaz/ts-spring-rest';

class ExampleController {
  @GetMapping( { path: '/example' } )
  handleGetRequest( @RequestParameters params: Record<string, string> )
  {
    // Use request parameters
  }
}
```

### `@Header`

- **Description**: Binds a single header to a single parameter and attempts to convert it to a primitive type if possible.

```typescript
import { Header } from '@xaerodegreaz/ts-spring-rest';

class ExampleController {
  @GetMapping( { path: '/example' } )
  handleGetRequest( @Header( 'Authorization' ) token: string )
  {
    // Use request header
  }
}
```

### `@Headers`

- **Description**: Binds all headers to an object, such as a custom one or a Record.

```typescript
import { Headers } from '@xaerodegreaz/ts-spring-rest';

class ExampleController {
  @GetMapping( { path: '/example' } )
  handleGetRequest( @Headers headers: Record<string, string> )
  {
    // Use request headers
  }
}
```

### `@ExceptionHandler`

- **Description**: This decorator will throw a `DecoratedMethodException` inside the `handleRequest` request function and will contain a `statusCode` for you to use in your exception handling. See the `handleRequest` function below for an example.

```typescript
import { ExceptionHandler } from '@xaerodegreaz/ts-spring-rest';

class ExampleController {
  @GetMapping( { path: '/example' } )
  @ExceptionHandler( { errorType: [TypeError], statusCode: 400 } )
  @ExceptionHandler( { errorType: [ReferenceError], statusCode: 404 } )
  handleGetRequest(  )
  {
    // Your function that can potentially throw errors
  }
}
```

## Handler Implementations

### `AwsLambdaHandler`

- **Description**: A handler for AWS Lambda events that translates them and passes them to the `handleRequest` function internally.

```typescript
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { AwsLambdaHandler } from '@xaerodegreaz/ts-spring-rest';

export const lambdaHandler = async ( event: APIGatewayProxyEvent, context: any ): Promise<APIGatewayProxyResult> => {
  const controller = new YourControllerClass();
  const handler = new AwsLambdaHandler( controller );
  return await handler.handle( event );
};
```

`Handler` implementations also gain access to the `withIocContainerGetMethod` that can can be used with IOC containers such as [tsyringe](https://www.npmjs.com/package/tsyringe), or [typescriot-ioc](https://www.npmjs.com/package/typescript-ioc) in order to construct your controller with its dependencies. Not IOC packages are included with this one, so refer to your vendor for documentation.

```typescript
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Container } from 'typescript-ioc';
import { AwsLambdaHandler } from '@xaerodegreaz/ts-spring-rest';

class YourControllerClass {
  constructor(private readonly dependency1: Dependency1, private readonly dependency2: Dependency2)
  {
  }
  
  @RequestMapping({path:'/example/get'})
  handleGet(@RequestHeaders headers: Record<string, string>, @RequestParameter('someParam') someParam: int){
    // handle your get
  }

  @PostMapping({path:'/example/post'})
  handleGet(@RequestBody myRecord: MyRecord){
    // handle your post
  }
}

export const lambdaHandler = async ( event: APIGatewayProxyEvent, context: any ): Promise<APIGatewayProxyResult> => {
  // Using the typescript-ioc package for dependency injection
  const handler = new AwsLambdaHandler( YourControllerClass ).withIocContainerGetMethod( Container.get );
  return await handler.handle( event );
};
```

## `handleRequest` Function

### Description

The `handleRequest` function is an internal utility function designed to handle HTTP requests based on metadata defined through decorators. It can be used as an alternative to the provided Handler implementations.

### Usage

```typescript
import { handleRequest } from '@xaerodegreaz/ts-spring-rest';

const exampleRequest = {
  method: 'GET',
  path: '/example',
  body: '{"key":"value"}',
  headers: {
    'Content-Type': 'application/json',
  },
};

const targetClass = new YourControllerClass();

try
{
  const response = await handleRequest( exampleRequest, targetClass );
  console.log( 'Response:', response );
}
catch ( error )
{
  if ( error instanceof DecoratedMethodException )
  {
    console.error( `Error: message:${error.message}, statusCode:${error.statusCode}` );
  }
  else
  {
    console.error( 'Unhandled Error:', error );
  }
}
```
