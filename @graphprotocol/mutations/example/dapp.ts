import {
  createMutations,
  createMutationsLink,
  Event,
  MutationContext,
  MutationStates,
  MutationStatesSub
} from '../src'
import exampleMutations, {
  Config,
  State,
  EventMap,
  MyEvent
} from './mutations'

import gql from 'graphql-tag'

// Create Executable & Executable Mutations
const mutations = createMutations({
  mutations: exampleMutations,
  subgraph: 'my-subgraph',
  node: 'https://graph-node.io',
  config: {
    a: async () => '',
    b: 3,
    c: {
      d: {
        e: () => true
      }
    }
  }
})

// Create an ApolloLink to execute the mutations
const link = createMutationsLink({ mutations })

// Execute a mutation without Apollo
const EXAMPLE = gql`
  mutation Example($input: String!) {
    example(input: $input) @client{
      output
    }
  }
`

// Context for the execution to use
type Context = MutationContext<Config, State, EventMap>
let context = { } as Context

// Subscribe to mutation state updates
const sub = new MutationStatesSub<State, EventMap>({ })

sub.subscribe((state: MutationStates<State, EventMap>) => {
  // Resolver defined state properties
  state.example.myValue

  // Log of all events emitted
  state.example.events.forEach((event: Event<EventMap>) => {
    switch (event.name) {
      case 'MY_EVENT': {
        const myEvent = event.payload as MyEvent
        myEvent.myValue
        break;
      }
    }
  })

  // Default values defined for you
  state.example.uuid
  state.example.progress
})

// Execute the mutation
const main = async () => {
  const { data } = await mutations.execute({
    query: EXAMPLE,
    variables: {
      input: "..."
    },
    operationName: "mutation",
    setContext: (newContext: Context) => {
      context = newContext
      return context
    },
    getContext: () => context,
    stateSub: sub
  })
}
