import {
  Event,
  EventTypeMap,
  MutationEvents,
  MutationState,
  InferEventPayload,
  StateBuilder,
  MutationStateSub
} from './types'
import { coreStateBuilder as core } from './core'
import { execFunc } from '../utils'

import { cloneDeep, merge } from 'lodash'

class StateUpdater<
  TState,
  TEventMap extends EventTypeMap
> {

  private _state: MutationState<TState, TEventMap>
  private _sub?: MutationStateSub<TState, TEventMap>
  private _ext?: StateBuilder<TState, TEventMap>

  constructor(
    uuid: string,
    ext?: StateBuilder<TState, TEventMap>,
    subscriber?: MutationStateSub<TState, TEventMap>
  ) {
    this._ext = ext
    this._sub = subscriber

    this._state = {
      events: [],
      ...core.getInitialState(uuid),
      ...(this._ext ? this._ext.getInitialState(uuid) : { } as TState),
    }

    // Publish the initial state
    this.publish()
  }

  public get current() {
    return cloneDeep(this._state)
  }

  public async dispatch<TEvent extends keyof MutationEvents<TEventMap>>(
    eventName: TEvent,
    payload: InferEventPayload<TEvent, MutationEvents<TEventMap>>
  ) {

    const event: Event<TEventMap> = {
      name: eventName,
      payload
    }

    // Append the event
    this._state.events.push(event)

    // Call all relevant reducers
    const coreReducers = core.reducers as any
    const coreReducer = core.reducer
    const extReducers = this._ext?.reducers as any
    const extReducer = this._ext?.reducer

    if (coreReducers && coreReducers[event.name] !== undefined) {
      const coreStatePartial = await execFunc(coreReducers[event.name], cloneDeep(this._state), payload)
      this._state = merge(this._state, coreStatePartial)
    } else if (coreReducer) {
      const coreStatePartial = await execFunc(coreReducer, cloneDeep(this._state), event)
      this._state = merge(this._state, coreStatePartial)
    }

    if (extReducers && extReducers[event.name] !== undefined) {
      const extStatePartial = await execFunc(extReducers[event.name], cloneDeep(this._state), payload)
      this._state = merge(this._state, extStatePartial)
    } else if (extReducer) {
      const extStatePartial = await execFunc(extReducer, cloneDeep(this._state), event)
      this._state = merge(this._state, extStatePartial)
    }

    // Publish the latest state
    this.publish()
  }

  private publish() {
    if (this._sub) {
      this._sub.next(cloneDeep(this._state))
    }
  }
}

export { StateUpdater }
export * from './core'
export * from './types'
