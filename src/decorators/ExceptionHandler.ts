interface Props {
  errorType: any[];
  statusCode: number;
}

export class DecoratedMethodException extends Error {
  constructor(
    public readonly e: Error,
    public readonly statusCode: number
  ) {
    super(e.message);
  }
}

export const ExceptionHandler = ( props: Props) => {
  return (_prototype: any, _methodName: string, descriptor: PropertyDescriptor) => {
    const original = descriptor.value;
    descriptor.value = function (...args: any[]) {
      try {
        return original.apply(this, args);
      } catch (e) {
        if (props.errorType.find((type) => e instanceof type)) {
          return new DecoratedMethodException(e, props.statusCode);
        }
      }
    };
    return descriptor;
  };
};
