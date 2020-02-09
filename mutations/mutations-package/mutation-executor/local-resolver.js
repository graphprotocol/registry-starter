"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const apollo_link_1 = require("apollo-link");
const apollo_link_state_1 = require("apollo-link-state");
const apollo_cache_inmemory_1 = require("apollo-cache-inmemory");
exports.default = (mutationQuery, resolvers) => {
    // @client directive must be used
    if (!utils_1.hasDirectives(['client'], mutationQuery.query)) {
        throw new Error(`Mutation '${mutationQuery.operationName}' is missing client directive`);
    }
    // Reuse the cache from the client
    const context = mutationQuery.getContext();
    const client = context.client;
    let cache;
    if (client && client.cache) {
        cache = client.cache;
    }
    else {
        cache = new apollo_cache_inmemory_1.InMemoryCache();
    }
    const link = apollo_link_state_1.withClientState({
        cache,
        resolvers
    });
    return apollo_link_1.makePromise(apollo_link_1.execute(link, {
        query: mutationQuery.query,
        variables: mutationQuery.variables,
        operationName: mutationQuery.operationName,
        context: mutationQuery.getContext()
    }));
};
//# sourceMappingURL=local-resolver.js.map