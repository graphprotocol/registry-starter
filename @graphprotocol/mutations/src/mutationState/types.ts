import {
  CoreEvents,
  CoreState
} from './core'
import { OptionalAsync } from '../utils'

import { BehaviorSubject } from 'rxjs'

// An aggregate of all possible MutationState properties
export type MutationState<
  TState = CoreState,
  TEventMap extends EventTypeMap = CoreEvents
> = { events: EventLog<TEventMap> } & CoreState & TState

// A collection of mutation states
export type MutationStates<
  TState = CoreState,
  TEventMap extends EventTypeMap = CoreEvents
> = {
  [mutation: string]: MutationState<TState, TEventMap>
}

// Mutation State Subscriptions
export class MutationStatesSub<
  TState = CoreState,
  TEventMap extends EventTypeMap = CoreEvents
> extends BehaviorSubject<MutationStates<TState, TEventMap>> { }
export class MutationStateSub<TState, TEventMap extends EventTypeMap> extends BehaviorSubject<MutationState<TState, TEventMap>> { }
export type MutationStateSubs<TState, TEventMap extends EventTypeMap> = MutationStateSub<TState, TEventMap>[]

// An aggregate of all possible MutationEvents
export type MutationEvents<TEventMap> = CoreEvents & TEventMap

export interface StateBuilder<TState, TEventMap extends EventTypeMap> {
  getInitialState(uuid: string): TState,
  // Event Specific Reducers
  reducers?: {
    [TEvent in keyof MutationEvents<TEventMap>]?: (
      state: MutationState<TState>,
      payload: InferEventPayload<TEvent, TEventMap>
    ) => OptionalAsync<Partial<MutationState<TState>>>
  },
  // Catch-All Reducer
  reducer?: (
    state: MutationState<TState>,
    event: Event<TEventMap>
  ) => OptionalAsync<Partial<MutationState<TState>>>
}

export interface EventPayload { }

export interface Event<TEventMap extends EventTypeMap = CoreEvents> {
  name: keyof MutationEvents<TEventMap>
  payload: EventPayload
}

export type EventLog<TEventMap extends EventTypeMap = CoreEvents> = Event<TEventMap>[]

export interface EventTypeMap {
  [eventName: string]: EventPayload
}

export type InferEventPayload<
  TEvent extends keyof TEvents,
  TEvents extends EventTypeMap
> = TEvent extends keyof TEvents ? TEvents[TEvent] : any
