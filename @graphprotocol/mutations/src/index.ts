import {
  Mutations,
  MutationsModule,
  MutationResult,
  MutationContext,
  MutationQuery,
  InternalMutationContext
} from './types'
import {
  ConfigGenerators,
  ConfigArguments,
  ConfigProperties
} from './config'
import {
  validateConfig,
  createConfig
} from './config'
import {
  CoreState,
  EventTypeMap,
  StateUpdater,
  MutationState,
  MutationStates,
  MutationStateSub,
  MutationStatesSub
} from './mutationState'
import { getUniqueMutations } from './utils'
import { DataSources } from './dataSources'
import {
  execLocalResolver,
  MutationExecutor
} from './mutationExecutors'

import { v4 } from 'uuid'
import { combineLatest } from 'rxjs'
import { ApolloLink, Operation, Observable } from 'apollo-link'

interface CreateMutationsOptions<
  TConfig extends ConfigGenerators,
  TState,
  TEventMap extends EventTypeMap
> {
  mutations: MutationsModule<TConfig, TState, TEventMap>,
  subgraph: string,
  node: string,
  config: ConfigArguments<TConfig>
  mutationExecutor?: MutationExecutor<TConfig, TState, TEventMap>
}

const createMutations = <
  TConfig extends ConfigGenerators,
  TState = CoreState,
  TEventMap extends EventTypeMap = { },
>(
  options: CreateMutationsOptions<TConfig, TState, TEventMap>
): Mutations<TConfig, TState, TEventMap> => {

  const { mutations, subgraph, node, config, mutationExecutor } = options

  // Validate that the configuration getters and setters match 1:1
  validateConfig(config, mutations.config)

  // One config instance for all mutation executions
  let configProperties: ConfigProperties<TConfig> | undefined = undefined

  // One datasources instance for all mutation executions
  const dataSources = new DataSources(
    subgraph, node, 'http://localhost:5001'
  )

  // Wrap each resolver and add a mutation state instance to the context
  const resolverNames = Object.keys(mutations.resolvers.Mutation)

  for (let i = 0; i < resolverNames.length; i++) {
    const name = resolverNames[i]
    const resolver = mutations.resolvers.Mutation[name]

    // Wrap the resolver
    mutations.resolvers.Mutation[name] = async (source, args, context, info) => {
      const internalContext = context as InternalMutationContext<TConfig, TState, TEventMap>
      const {
        _rootSub,
        _mutationSubs,
        _mutationsCalled
      } = internalContext

      // If a root mutation state sub is being used, and we haven't
      // instantiated subscribes for each mutation being executed...
      if (_rootSub && _mutationSubs.length === 0) {

        // Create observers for each mutation that's called
        _mutationsCalled.forEach(() => {
          _mutationSubs.push(
            new MutationStateSub<TState, TEventMap>(
              { } as MutationState<TState, TEventMap>
            )
          )
        })

        // Subscribe to all of the mutation observers
        combineLatest(_mutationSubs).subscribe((values) => {
          const result: MutationStates<TState, TEventMap> = { }

          values.forEach((value, index) => {
            result[_mutationsCalled[index]] = value
          })

          _rootSub.next(result)
        })
      }

      // Generate a unique ID for this resolver execution
      let uuid = v4()

      // Create a new StateUpdater for the resolver to dispatch updates through
      const state = new StateUpdater<TState, TEventMap>(
        uuid, mutations.stateBuilder,
        // Initialize StateUpdater with a state subscription if one is present
        _rootSub ? _mutationSubs.shift() : undefined
      )

      // Create a new context with the state added to context.graph
      const newContext = {
        ...context,
        graph: {
          ...context.graph,
          state
        }
      } as MutationContext<TConfig, TState, TEventMap>

      // Execute the resolver
      return await resolver(source, args, newContext, info)
    }
  }

  return {
    execute: async (
      mutationQuery: MutationQuery<TState, TEventMap>,
      stateSub?: MutationStatesSub<TState, TEventMap>
    ) => {
      const { setContext, getContext, query } = mutationQuery

      // Create the config instance during
      // the first mutation execution
      if (!configProperties) {
        configProperties = await createConfig(
          config,
          mutations.config
        )
      }

      const context = getContext() as InternalMutationContext<TConfig, TState, TEventMap>

      // Set the context
      setContext({
        graph: {
          config: configProperties,
          dataSources,
          // This will get overridden by the wrapped resolver above
          state: { } as StateUpdater<TState, TEventMap>,
        },
        _rootSub: stateSub ? stateSub : context._rootSub,
        _mutationSubs: [],
        _mutationsCalled: getUniqueMutations(query, Object.keys(mutations.resolvers.Mutation)),
      })

      // Execute the mutation
      if (mutationExecutor) {
        return await mutationExecutor(
          mutationQuery, mutations.resolvers
        )
      } else {
        return await execLocalResolver(
          mutationQuery, mutations.resolvers
        )
      }
    },
    configure: async (config: ConfigArguments<TConfig>) => {
      validateConfig(config, mutations.config)
      configProperties = await createConfig(config, mutations.config)
    }
  }
}

const createMutationsLink = <
  TConfig extends ConfigGenerators,
  TState,
  TEventMap extends EventTypeMap,
> (
  { mutations }: { mutations: Mutations<TConfig, TState, TEventMap> }
): ApolloLink => {
  return new ApolloLink((operation: Operation) => {

    const setContext = (context: any) => {
      return operation.setContext(context)
    }

    const getContext = () => {
      return operation.getContext()
    }

    return new Observable(observer => {
      mutations.execute({
        query: operation.query,
        variables: operation.variables,
        operationName: operation.operationName,
        setContext: setContext,
        getContext: getContext
      }).then((result: MutationResult) => {
        observer.next(result)
        observer.complete()
      })
      .catch((e: Error) => observer.error(e))
    })
  })
}

export {
  createMutations,
  createMutationsLink
}

export {
  MutationContext,
  MutationResolvers,
  Mutations
} from './types'

export { MutationExecutor } from './mutationExecutors'

export {
  CoreState,
  CoreEvents,
  Event,
  EventPayload,
  MutationState,
  MutationStates,
  MutationStatesSub,
  ProgressUpdateEvent,
  StateBuilder,
  StateUpdater,
  TransactionCompletedEvent,
  TransactionCreatedEvent,
  TransactionErrorEvent
} from './mutationState'
