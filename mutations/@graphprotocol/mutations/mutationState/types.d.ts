import { CoreEvents, CoreState } from './core';
import { OptionalAsync } from '../utils';
import { BehaviorSubject } from 'rxjs';
export declare type MutationState<TState = CoreState, TEventMap extends EventTypeMap = CoreEvents> = {
    events: EventLog<TEventMap>;
} & CoreState & TState;
export declare type MutationStates<TState = CoreState, TEventMap extends EventTypeMap = CoreEvents> = {
    [mutation: string]: MutationState<TState, TEventMap>;
};
export declare class MutationStatesSub<TState = CoreState, TEventMap extends EventTypeMap = CoreEvents> extends BehaviorSubject<MutationStates<TState, TEventMap>> {
}
export declare class MutationStateSub<TState, TEventMap extends EventTypeMap> extends BehaviorSubject<MutationState<TState, TEventMap>> {
}
export declare type MutationStateSubs<TState, TEventMap extends EventTypeMap> = MutationStateSub<TState, TEventMap>[];
export declare type MutationEvents<TEventMap> = CoreEvents & TEventMap;
export interface StateBuilder<TState, TEventMap extends EventTypeMap> {
    getInitialState(uuid: string): TState;
    reducers?: {
        [TEvent in keyof MutationEvents<TEventMap>]?: (state: MutationState<TState>, payload: InferEventPayload<TEvent, TEventMap>) => OptionalAsync<Partial<MutationState<TState>>>;
    };
    reducer?: (state: MutationState<TState>, event: Event<TEventMap>) => OptionalAsync<Partial<MutationState<TState>>>;
}
export interface EventPayload {
}
export interface Event<TEventMap extends EventTypeMap = CoreEvents> {
    name: keyof MutationEvents<TEventMap>;
    payload: EventPayload;
}
export declare type EventLog<TEventMap extends EventTypeMap = CoreEvents> = Event<TEventMap>[];
export interface EventTypeMap {
    [eventName: string]: EventPayload;
}
export declare type InferEventPayload<TEvent extends keyof TEvents, TEvents extends EventTypeMap> = TEvent extends keyof TEvents ? TEvents[TEvent] : any;
