import ApolloClient from 'apollo-client'
import gql from 'graphql-tag'
import {
  InMemoryCache,
  NormalizedCacheObject
} from 'apollo-cache-inmemory'
import 'cross-fetch/polyfill'

import {
  createMutations,
  createMutationsLink,
  CoreEvents,
  CoreState,
  Mutations,
  MutationContext,
  MutationStates
} from '../'
import { MutationStatesSub } from '../mutationState'

const resolvers = {
  Mutation: {
    testResolve: async () => {
      return true
    },
    secondTestResolve: async () => {
      return true
    },
    dispatchStateEvent: async (_, __, context: MutationContext<Config>) => {
      await context.graph.state.dispatch('PROGRESS_UPDATE', { value: 50 })
      return true
    },
    testConfig: async (_, __, context: MutationContext<Config>) => {
      return context.graph.config.value
    }
  }
}

type Config = typeof config
const config = {
  value: (arg: string) => arg
}

describe('Mutations package - CreateMutations', () => {

  let client: ApolloClient<NormalizedCacheObject>
  let mutations: Mutations<Config>
  let observer = new MutationStatesSub({ } as MutationStates<CoreState>)
  let latestState: MutationStates<CoreState> = {}

  beforeAll(() => {
    mutations = createMutations({
      mutations: {
        resolvers,
        config
      },
      subgraph: '',
      node: '',
      config: {
        value: '...'
      }
    })

    const mutationLink = createMutationsLink({ mutations })
    
    client = new ApolloClient({
      link: mutationLink,
      cache: new InMemoryCache()
    })

    observer.subscribe((value: MutationStates<CoreState>) => {
      latestState = value
    })
  })

  it('Successfully creates mutations, link and executes mutations with it. No observer provided', async () => {
    const { data }  = await client.mutate({
      mutation: gql`
        mutation testResolve {
            testResolve @client
        }
      `
    })

    expect(data.testResolve).toEqual(true)
  })

  it('Correctly wraps resolvers and formats observer results to object with mutation name as key and state as value', async () => {
    await client.mutate({
      mutation: gql`
        mutation testResolve {
            testResolve @client
        }
      `,
      context: {
        _rootSub: observer
      }
    })

    expect(latestState).toHaveProperty('testResolve')
    expect(latestState.testResolve.events).toBeTruthy()
  })

  it('Executes multiple mutations in the same mutation query and dispatches object with different states for each', async () => {
    await client.mutate({
      mutation: gql`
        mutation testResolve {
            testResolve @client
            secondTestResolve @client
        }
      `,
      context: {
        _rootSub: observer
      }
    })

    expect(latestState).toHaveProperty('testResolve')
    expect(latestState.testResolve.events).toBeTruthy()

    expect(latestState).toHaveProperty('secondTestResolve')
    expect(latestState.secondTestResolve.events).toBeTruthy()

    expect(latestState.testResolve).not.toEqual(latestState.secondTestResolve)
  })

  it('Executes the same mutation several times in the same query and dispatches object with different states for each', async () => {
    await client.mutate({
      mutation: gql`
        mutation testResolve {
            testResolve @client
            testResolve @client
        }
      `,
      context: {
        _rootSub: observer
      }
    })

    expect(latestState).toHaveProperty('testResolve_1')
    expect(latestState.testResolve_1.events).toBeTruthy()

    expect(latestState).toHaveProperty('testResolve_2')
    expect(latestState.testResolve_2.events).toBeTruthy()

    expect(latestState.testResolve_1).not.toEqual(latestState.testResolve_2)
  })

  describe('mutations.execute(...)', () => {
    it('Correctly executes mutation without ApolloLink', async () => {
      let context = { } as MutationContext<Config>
  
      const { data } = await mutations.execute({
        query: gql`
          mutation testResolve {
              testResolve @client
          }
        `,
        variables: { },
        operationName: 'mutation',
        getContext: () => context,
        setContext: (newContext: MutationContext<Config>) => {
          context = newContext
          return context
        }
      })
  
      expect(data.testResolve).toEqual(true)
    })

    it('State is correctly updated', async () => {
      const observer = new MutationStatesSub<CoreState, CoreEvents>({ })

      let context = {
        _rootSub: observer
      }

      let progress = 0

      const sub = observer.subscribe((state: MutationStates<CoreState, CoreEvents>) => {
        if (state.dispatchStateEvent) {
          progress = state.dispatchStateEvent.progress
        }
      })

      await mutations.execute({
        query: gql`
          mutation TestResolve {
            dispatchStateEvent @client
          }
        `,
        variables: { },
        operationName: 'mutation',
        getContext: () => context,
        setContext: (newContext: any) => {
          context = newContext
          return context
        },
        stateSub: observer
      })

      expect(progress).toEqual(50)
      sub.unsubscribe()
    })
  })

  describe('mutations.configure(...)', () => {
    it('Correctly reconfigures the mutation module', async () => {
      {
        const { data }  = await client.mutate({
          mutation: gql`
            mutation testConfig {
              testConfig @client
            }
          `
        })
  
        expect(data.testConfig).toEqual('...')
      }
  
      await mutations.configure({
        value: 'foo'
      })
  
      {
        const { data }  = await client.mutate({
          mutation: gql`
            mutation testConfig {
              testConfig @client
            }
          `
        })
  
        expect(data.testConfig).toEqual('foo')
      }
    })

    it('Detects incorrect configuration values object', async () => {
      try {
        await mutations.configure({ notValues: '' } as any)
        throw Error('This should never happen...')
      } catch (e) {
        expect(e.message).toBe(`Failed to find mutation configuration value for the property 'value'.`)
      }
    })
  })
})
