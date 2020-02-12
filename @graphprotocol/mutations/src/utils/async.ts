export type OptionalAsync<T> = Promise<T> | T

const isPromise = (test: any) => test && typeof test.then === 'function'

export const execFunc = async (func: any, ...args: any[]) => {
  let result = func(...args)
  if (isPromise(result)) {
    result = await result
  }
  return result
}
