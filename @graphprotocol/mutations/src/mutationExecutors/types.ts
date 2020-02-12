import {
  MutationQuery,
  MutationResolvers,
  MutationResult,
} from '../types'
import { ConfigGenerators } from '../config'
import { EventTypeMap } from '../mutationState'

export type MutationExecutor<
  TConfig extends ConfigGenerators,
  TState,
  TEventMap extends EventTypeMap
> = (
  query: MutationQuery<TState, TEventMap>,
  resolvers: MutationResolvers<TConfig, TState, TEventMap>
) => Promise<MutationResult>
