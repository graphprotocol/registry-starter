import { v4 } from 'uuid'
import {
  CoreState,
  CoreEvents,
  TransactionCreatedEvent
} from '../core'
import {
  Event,
  EventPayload,
  MutationState,
  MutationStateSub,
  StateBuilder
} from '../types'
import { StateUpdater } from '../index'

const mockTransaction: TransactionCreatedEvent = {
  id: "Test Id",
  to: "0x0",
  from: "0x0",
  data: "",
  amount: "0",
  chainId: "",
  description: "Test Description"
}

describe("Core Mutation State", () => {

  let uuid: string
  let latestState: MutationState<CoreState>
  let observer: MutationStateSub<CoreState, CoreEvents>
  let state: StateUpdater<CoreState, CoreEvents>

  beforeEach(() => {

    uuid = v4()

    observer = new MutationStateSub<CoreState, CoreEvents>({} as MutationState<CoreState>)

    state = new StateUpdater<CoreState, CoreEvents>(
      uuid, undefined, observer
    )

    observer.subscribe((value) => {
      latestState = value
    })
  })

  it("Correctly dispatches state update", async () => {
    await state.dispatch("PROGRESS_UPDATE", { value: 5 })

    expect(latestState.uuid).toEqual(uuid)
    expect(latestState.progress).toEqual(5)
    expect(latestState.events).toHaveLength(1)
    expect(latestState.events[0].name).toEqual("PROGRESS_UPDATE")
    expect(latestState.events[0].payload).toEqual({ value: 5 })

  })

  it("State dispatched is immutable", async () => {
    await state.dispatch("PROGRESS_UPDATE", { value: 5 })

    latestState.progress = 100

    await state.dispatch("TRANSACTION_CREATED", mockTransaction)

    expect(latestState.progress).toEqual(5)
  })

  it("Dispatches state updates in correct order", async () => {
    await state.dispatch("PROGRESS_UPDATE", { value: 5 })
    await state.dispatch("TRANSACTION_CREATED", mockTransaction)

    const currentState = state.current

    expect(currentState.events[0].name).toEqual("PROGRESS_UPDATE")
    expect(currentState.events[0].payload).toEqual( { value: 5 })

    expect(currentState.events[1].name).toEqual("TRANSACTION_CREATED")
    expect(currentState.events[1].payload).toEqual(mockTransaction)

  })

  it("Fails if PROGRESS_UPDATE event receives number lower than 0 or higher than 100 or non integer", async () => {
    expect(state.dispatch("PROGRESS_UPDATE", { value: 105 } as any)).rejects.toThrow()
    expect(state.dispatch("PROGRESS_UPDATE", { value: -5 } as any)).rejects.toThrow()
    expect(state.dispatch("PROGRESS_UPDATE", { value: 10.5 } as any)).rejects.toThrow()
  })

})

describe("Extended Mutation State", () => {

  interface CustomEvent extends EventPayload {
    myValue: string,
    myFlag: boolean
  }
  
  type EventMap = {
    'CUSTOM_EVENT': CustomEvent
    'RANDOM_EVENT': { }
  }
  
  interface State {
    myValue: string
    myFlag: boolean
    catchAll: boolean
  }

  let uuid: string
  let latestState: State
  let observer: MutationStateSub<State, EventMap>
  let state: StateUpdater<State, EventMap>
  
  const stateBuilder: StateBuilder<State, EventMap> = {
    getInitialState(): State {
      return {
        myValue: 'initial',
        myFlag: true,
        catchAll: false
      }
    },
    reducers: {
      'CUSTOM_EVENT': async (state: MutationState<State>, payload: CustomEvent) => {
        return {
          myValue: 'true'
        }
      }
    },
    reducer: async (state: MutationState<State>, event: Event<EventMap>) => {
      switch(event.name){
        case "CUSTOM_EVENT": {
          return {
            catchAll: true
          }
        }

        case "RANDOM_EVENT": {
          return {
            catchAll: true
          }
        }

        case "PROGRESS_UPDATE": {
          return {
            catchAll: true
          }
        }
      }
    }
  }

  beforeEach(() => {
    uuid = v4()
    observer = new MutationStateSub<State, EventMap>({} as MutationState<State, EventMap>)
    state = new StateUpdater<State, EventMap>(
      uuid, stateBuilder, observer
    )

    observer.subscribe((value) => {
      latestState = value
    })
  })

  it("Includes extended state with correct initial values", () => {
    const currentState = state.current
    
    expect(currentState.myFlag).toEqual(true)
    expect(currentState.myValue).toEqual('initial')
    expect(currentState.catchAll).toEqual(false)
  })

  it("Correctly executes CUSTOM_EVENT defined reducer", async () => {
    await state.dispatch("CUSTOM_EVENT", { myFlag: false, myValue: 'false'})

    const currentState = state.current
    
    expect(currentState.myFlag).toEqual(true)
    expect(currentState.myValue).toEqual('true')
  })

  it("Includes custom events alongside core events in the events history", async () => {
    await state.dispatch("TRANSACTION_CREATED", mockTransaction)
    await state.dispatch("CUSTOM_EVENT", { myFlag: false, myValue: 'false'})

    const currentState = state.current

    expect(currentState.events[1].name).toEqual("CUSTOM_EVENT")
    expect(currentState.events[1].payload).toEqual({ myFlag: false, myValue: 'false' })
  })

  it("Executes catch-all reducer if specific event reducer is not found", async () => {
    await state.dispatch("RANDOM_EVENT", { })

    const currentState = state.current

    expect(currentState.catchAll).toEqual(true)
  })

  it("Executes specific custom event reducer if found, even if same custom event is defined in catch-all reducer", async () => {
    await state.dispatch("CUSTOM_EVENT", { myValue: 'false', myFlag: false })

    const currentState = state.current

    expect(currentState.catchAll).toEqual(false)
  })

  it("Executes both core reducer and catch-all reducer if a core event is supported in it", async () => {
    await state.dispatch("PROGRESS_UPDATE", { value: 50 })

    expect(state.current.progress).toEqual(50)
    expect(state.current.catchAll).toEqual(true)
  })
})
