import { InMemoryCache } from 'apollo-boost'
import ApolloClient from 'apollo-client'
import { createHttpLink } from 'apollo-link-http'
import { getMainDefinition } from 'apollo-utilities'
import { split } from 'apollo-link'
import fetch from 'isomorphic-fetch'
import tokenRegistryMutations from 'token-registry-mutations'
import { createMutations, createMutationsLink } from '@graphprotocol/mutations'

const networkURI = process.env.GATSBY_NETWORK_URI
const ipfsURI = process.env.GATSBY_IPFS_HTTP_URI

console.log(networkURI, ipfsURI)

const mutations = createMutations({
  mutations: {
    resolvers: tokenRegistryMutations.resolvers,
    config: tokenRegistryMutations.config,
    stateBuilder: tokenRegistryMutations.stateBuilder,
  },
  subgraph: 'example',
  node: ipfsURI,
  config: {
    ethereum: async () => {
      const { ethereum } = window

      if (!ethereum) {
        throw Error('Please install metamask')
      }

      await ethereum.enable()
      return window.web3.currentProvider
    },
    ipfs: ipfsURI,
  },
})

const queryLink = createHttpLink({
  uri: `${networkURI}/subgraphs/name/graphprotocol/registry-starter`,
})

const mutationLink = createMutationsLink({ mutations })

const link = split(
  ({ query }) => {
    const node = getMainDefinition(query)
    return node.kind === 'OperationDefinition' && node.operation === 'mutation'
  },
  mutationLink,
  queryLink
)

const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
})

export default client
