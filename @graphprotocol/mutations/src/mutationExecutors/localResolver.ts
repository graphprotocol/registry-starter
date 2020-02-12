import {
  MutationQuery,
  MutationResult,
  MutationResolvers
} from '../types'
import { hasDirectives } from '../utils'
import { ConfigGenerators } from '../config'
import { EventTypeMap } from '../mutationState'

import {
  execute,
  makePromise
} from 'apollo-link'
import { withClientState } from 'apollo-link-state'
import { InMemoryCache } from 'apollo-cache-inmemory'

const localResolver = <
  TConfig extends ConfigGenerators,
  TState,
  TEventMap extends EventTypeMap
> (
  mutationQuery: MutationQuery<TState, TEventMap>,
  resolvers: MutationResolvers<TConfig, TState, TEventMap>
): Promise<MutationResult> => {

  // @client directive must be used
  if (!hasDirectives(['client'], mutationQuery.query)) {
    throw new Error(`Mutation '${mutationQuery.operationName}' is missing client directive`)
  }

  // Reuse the cache from the client
  const context = mutationQuery.getContext()
  const client = context.client
  let cache

  if (client && client.cache) {
    cache = client.cache
  } else {
    cache = new InMemoryCache()
  }

  const link = withClientState({
    cache,
    resolvers
  })

  return makePromise(
    execute(link, {
      query: mutationQuery.query,
      variables: mutationQuery.variables,
      operationName: mutationQuery.operationName,
      context: mutationQuery.getContext()
    })
  )
}

export default localResolver
