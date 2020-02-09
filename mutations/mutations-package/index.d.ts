import { Mutations, MutationsModule } from './types';
import { ConfigGenerators, ConfigArguments } from './config';
import { CoreState, EventTypeMap } from './mutationState';
import { MutationExecutor } from './mutationExecutors';
import { ApolloLink } from 'apollo-link';
interface CreateMutationsOptions<TConfig extends ConfigGenerators, TState, TEventMap extends EventTypeMap> {
    mutations: MutationsModule<TConfig, TState, TEventMap>;
    subgraph: string;
    node: string;
    config: ConfigArguments<TConfig>;
    mutationExecutor?: MutationExecutor<TConfig, TState, TEventMap>;
}
declare const createMutations: <TConfig extends ConfigGenerators, TState = CoreState, TEventMap extends EventTypeMap = {}>(options: CreateMutationsOptions<TConfig, TState, TEventMap>) => Mutations<TConfig, TState, TEventMap>;
declare const createMutationsLink: <TConfig extends ConfigGenerators, TState, TEventMap extends EventTypeMap>({ mutations }: {
    mutations: Mutations<TConfig, TState, TEventMap>;
}) => ApolloLink;
export { createMutations, createMutationsLink };
export { MutationContext, MutationResolvers, Mutations } from './types';
export { MutationExecutor } from './mutationExecutors';
export { CoreState, CoreEvents, Event, EventPayload, MutationState, MutationStates, MutationStatesSub, ProgressUpdateEvent, StateBuilder, StateUpdater, TransactionCompletedEvent, TransactionCreatedEvent, TransactionErrorEvent } from './mutationState';
