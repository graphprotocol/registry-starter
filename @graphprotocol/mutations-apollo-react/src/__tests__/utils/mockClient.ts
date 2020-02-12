import { InMemoryCache } from 'apollo-cache-inmemory'
import ApolloClient from 'apollo-client'
import { schema } from './schema'

const cache = new InMemoryCache()
cache.writeData({
    data: {
        getTodos: []
    }
})

export const statesToPublish = [{ testResolve: "First"}, { testResolve: "Second"}, { testResolve: "Third"}]

export const client = new ApolloClient({
    resolvers: {
      Mutation: {
          testResolve: async (_, __, context) => {

            if(!context._rootSub){
              return false
            }
            context._rootSub.next(statesToPublish[0])
            context._rootSub.next(statesToPublish[1])
            context._rootSub.next(statesToPublish[2])
            return true
        }
      }
    },
    cache,
    typeDefs: schema
})
