import { EventTypeMap, MutationEvents, MutationState, InferEventPayload, StateBuilder, MutationStateSub } from './types';
declare class StateUpdater<TState, TEventMap extends EventTypeMap> {
    private _state;
    private _sub?;
    private _ext?;
    constructor(uuid: string, ext?: StateBuilder<TState, TEventMap>, subscriber?: MutationStateSub<TState, TEventMap>);
    get current(): MutationState<TState, TEventMap>;
    dispatch<TEvent extends keyof MutationEvents<TEventMap>>(eventName: TEvent, payload: InferEventPayload<TEvent, MutationEvents<TEventMap>>): Promise<void>;
    private publish;
}
export { StateUpdater };
export * from './core';
export * from './types';
