import { MutationQuery, MutationResult, MutationResolvers } from '../types';
import { ConfigGenerators } from '../config';
import { EventTypeMap } from '../mutationState';
declare const localResolver: <TConfig extends ConfigGenerators, TState, TEventMap extends EventTypeMap>(mutationQuery: MutationQuery<TState, TEventMap>, resolvers: MutationResolvers<TConfig, TState, TEventMap>) => Promise<MutationResult>;
export default localResolver;
