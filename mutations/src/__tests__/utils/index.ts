import ApolloClient from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import HDWalletProvider from '@truffle/hdwallet-provider'
import {
  createMutations,
  createMutationsLink
} from '../../../@graphprotocol/mutations'

const IpfsClient = require('ipfs-http-client')

const mnemonic = "biology lend alone bracket exist betray ability ticket fury lady rapid bulk"

//TODO: Ethers's JSONRpcProvider results in error 'Method [object Object] not supported'

const provider = new HDWalletProvider(mnemonic, "http://localhost:8545")

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
      ethereum: provider,
      ipfs: "http://localhost:5001"
    }
  })

  const link = createMutationsLink( { mutations })

  return new ApolloClient({
    link,
    cache: new InMemoryCache()
  })
}