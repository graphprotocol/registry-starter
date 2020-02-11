import ApolloClient from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import HDWalletProvider from '@truffle/hdwallet-provider'

import { createMutations, createMutationsLink } from '../../../@graphprotocol/mutations'

const IpfsClient = require('ipfs-http-client')

const ethereumProvider = new HDWalletProvider(
  "myth like bonus scare over problem client lizard pioneer submit female collect",
  "http://localhost:8545"
)

export const getFromIpfs = async (ipfs: any, hash: string) => {
  let result: string;

  for await (const returnedValue of ipfs.get(`/ipfs/${hash}`)) {
    for await (const content of returnedValue.content as Buffer) {
      result = content.toString()
    }
  }

  return result
}

export interface TokenMetadata {
  symbol: string,
  description: string
  image: string,
  decimals: string
}

export const ipfsClient = new IpfsClient({ host: 'localhost', port: '5001' })
  
export const createApolloClient = (resolvers, config, stateBuilder) => {
  const mutations = createMutations({
    mutations: {
      resolvers,
      config,
      stateBuilder
    },
    subgraph: '',
    node: 'http://localhost:5001',
    config: {
      ethereum: ethereumProvider,
      ipfs: "http://localhost:5001"
    }
  })

  const link = createMutationsLink( { mutations })

  return new ApolloClient({
    link,
    cache: new InMemoryCache()
  })
}