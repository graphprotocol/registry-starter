"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config");
const mutationState_1 = require("./mutationState");
const utils_1 = require("./utils");
const dataSources_1 = require("./dataSources");
const mutationExecutors_1 = require("./mutationExecutors");
const uuid_1 = require("uuid");
const rxjs_1 = require("rxjs");
const apollo_link_1 = require("apollo-link");
const createMutations = (options) => {
    const { mutations, subgraph, node, config, mutationExecutor } = options;
    // Validate that the configuration getters and setters match 1:1
    config_1.validateConfig(config, mutations.config);
    // One config instance for all mutation executions
    let configProperties = undefined;
    // One datasources instance for all mutation executions
    const dataSources = new dataSources_1.DataSources(subgraph, node, 'http://localhost:5001');
    // Wrap each resolver and add a mutation state instance to the context
    const resolverNames = Object.keys(mutations.resolvers.Mutation);
    for (let i = 0; i < resolverNames.length; i++) {
        const name = resolverNames[i];
        const resolver = mutations.resolvers.Mutation[name];
        // Wrap the resolver
        mutations.resolvers.Mutation[name] = (source, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
            const internalContext = context;
            const { _rootSub, _mutationSubs, _mutationsCalled } = internalContext;
            // If a root mutation state sub is being used, and we haven't
            // instantiated subscribes for each mutation being executed...
            if (_rootSub && _mutationSubs.length === 0) {
                // Create observers for each mutation that's called
                _mutationsCalled.forEach(() => {
                    _mutationSubs.push(new mutationState_1.MutationStateSub({}));
                });
                // Subscribe to all of the mutation observers
                rxjs_1.combineLatest(_mutationSubs).subscribe((values) => {
                    const result = {};
                    values.forEach((value, index) => {
                        result[_mutationsCalled[index]] = value;
                    });
                    _rootSub.next(result);
                });
            }
            // Generate a unique ID for this resolver execution
            let uuid = uuid_1.v4();
            // Create a new StateUpdater for the resolver to dispatch updates through
            const state = new mutationState_1.StateUpdater(uuid, mutations.stateBuilder, 
            // Initialize StateUpdater with a state subscription if one is present
            _rootSub ? _mutationSubs.shift() : undefined);
            // Create a new context with the state added to context.graph
            const newContext = Object.assign(Object.assign({}, context), { graph: Object.assign(Object.assign({}, context.graph), { state }) });
            // Execute the resolver
            return yield resolver(source, args, newContext, info);
        });
    }
    return {
        execute: (mutationQuery, stateSub) => __awaiter(void 0, void 0, void 0, function* () {
            const { setContext, getContext, query } = mutationQuery;
            // Create the config instance during
            // the first mutation execution
            if (!configProperties) {
                configProperties = yield config_1.createConfig(config, mutations.config);
            }
            const context = getContext();
            // Set the context
            setContext({
                graph: {
                    config: configProperties,
                    dataSources,
                    // This will get overridden by the wrapped resolver above
                    state: {},
                },
                _rootSub: stateSub ? stateSub : context._rootSub,
                _mutationSubs: [],
                _mutationsCalled: utils_1.getUniqueMutations(query, Object.keys(mutations.resolvers.Mutation)),
            });
            // Execute the mutation
            if (mutationExecutor) {
                return yield mutationExecutor(mutationQuery, mutations.resolvers);
            }
            else {
                return yield mutationExecutors_1.execLocalResolver(mutationQuery, mutations.resolvers);
            }
        }),
        configure: (config) => __awaiter(void 0, void 0, void 0, function* () {
            config_1.validateConfig(config, mutations.config);
            configProperties = yield config_1.createConfig(config, mutations.config);
        })
    };
};
exports.createMutations = createMutations;
const createMutationsLink = ({ mutations }) => {
    return new apollo_link_1.ApolloLink((operation) => {
        const setContext = (context) => {
            return operation.setContext(context);
        };
        const getContext = () => {
            return operation.getContext();
        };
        return new apollo_link_1.Observable(observer => {
            mutations.execute({
                query: operation.query,
                variables: operation.variables,
                operationName: operation.operationName,
                setContext: setContext,
                getContext: getContext
            }).then((result) => {
                observer.next(result);
                observer.complete();
            })
                .catch((e) => observer.error(e));
        });
    });
};
exports.createMutationsLink = createMutationsLink;
var mutationState_2 = require("./mutationState");
exports.MutationStatesSub = mutationState_2.MutationStatesSub;
exports.StateUpdater = mutationState_2.StateUpdater;
//# sourceMappingURL=index.js.map