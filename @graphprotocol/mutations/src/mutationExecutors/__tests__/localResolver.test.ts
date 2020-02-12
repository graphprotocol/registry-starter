import localResolver from '../localResolver'

import {
  ApolloLink,
  execute,
  makePromise,
  Operation,
  Observable
} from 'apollo-link'
import gql from 'graphql-tag'

const resolvers = {
  Mutation: {
    testResolve: async () => {
      return true
    }
  }
}

let link: ApolloLink

describe("LocalResolver", () => {

  beforeAll(() => {

    link = new ApolloLink((operation: Operation) =>
      new Observable(observer => {
        localResolver({
          query: operation.query,
          variables: operation.variables,
          operationName: operation.operationName,
          setContext: operation.setContext as any,
          getContext: operation.getContext as any
        }, resolvers).then(
          (result: any) => {
            observer.next(result)
            observer.complete()
          },
          (e: Error) => observer.error(e)
        )
      }))
  })

  it("Throws error if client directive is missing", async () => {
    expect(
      makePromise(
        execute(link, {
          query: gql`
            mutation testResolve {
                testResolve
            }
          `
        })
      )
    ).rejects.toThrow()
  })

  it("Correctly executes local mutation resolver", async () => {

    const { data } = await makePromise(
      execute(link, {
        query: gql`
          mutation testResolve {
              testResolve @client
          }
        `
      })
    )

    expect(data).toBeTruthy()
    expect(data?.testResolve).toEqual(true)
  })
})
