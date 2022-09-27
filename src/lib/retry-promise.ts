import { operation, OperationOptions } from 'retry';

export function withRetry<A extends [], R>(
  fn: (...args: A) => Promise<R>,
  opts?: OperationOptions
): (...args: A) => Promise<R> {
  return (...args) => {
    const op = operation(opts);

    return new Promise((resolve, reject) => {
      op.attempt(() => {
        fn(...args).then(resolve, (err) => {
          if (op.retry(err)) return;

          reject(op.mainError());
        });
      });
    });
  };
}
