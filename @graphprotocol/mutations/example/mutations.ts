import {
  Event,
  EventPayload,
  MutationState,
  StateBuilder,
  ProgressUpdateEvent
} from '../src'

const resolvers = {
  Mutation: {
    execFoo: () => {},
    execBar: () => {}
  }
}

type Config = typeof config

const config = {
  a: (name: string): string => {
    return `Hi my name is ${name}!`
  },
  b: (value: number): number => {
    return 1 + value
  },
  c: {
    d: {
      e: (value: boolean): string => {
        return 'hey'
      }
    }
  }
}

interface State {
  myValue: boolean
}

interface MyEvent extends EventPayload {
  myValue: boolean
}

type EventMap = {
  'MY_EVENT': MyEvent
}

const stateBuilder: StateBuilder<State, EventMap> = {
  getInitialState() {
    return {
      myValue: false
    }
  },
  reducers: {
    'MY_EVENT': (state: MutationState<State>, payload: MyEvent) => {
      return {
        myValue: payload.myValue
      }
    }
  },
  // Catch all reducer
  reducer: (state: MutationState<State>, event: Event<EventMap>) => {
    switch (event.name) {
      case 'PROGRESS_UPDATE':
        // do something custom, in addition to the core reducer
        const payload = event.payload as ProgressUpdateEvent
        return { }
      default:
        return { }
    }
  }
}

export default {
  resolvers,
  config,
  stateBuilder
}

export {
  Config,
  State,
  EventMap,
  MyEvent
}
