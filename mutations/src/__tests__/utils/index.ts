import ApolloClient from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { ethers } from 'ethers'
import {
  createMutations,
  createMutationsLink
} from '@graphprotocol/mutations'

const IpfsClient = require('ipfs-http-client')

const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545')

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
  
export const createApolloClient = mutationsModule => {
  const mutations = createMutations({
    mutations: mutationsModule,
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