import HDWalletProvider from '@truffle/hdwallet-provider'
const IpfsClient = require('ipfs-http-client')
import { AsyncSendable, Web3Provider } from 'ethers/providers'
import { ethers, Contract } from 'ethers'
import gql from 'graphql-tag'
import {
  execute,
  makePromise,
  ApolloLink
} from 'apollo-link'
import { withClientState } from 'apollo-link-state'
import { InMemoryCache } from 'apollo-cache-inmemory'

import resolvers from '..'

describe("Mutation Resolvers", () => {

  let mockContext: any, link: ApolloLink

  beforeAll(async () => {

    const ethereumProvider = new HDWalletProvider(
      "0xb0057716d5917badaf911b193b12b910811c1497b5bada8d7711f758981c3773",
      "http://localhost:8545"
    )

    mockContext = {
      graph: {
        config: {
          ethereum: new Web3Provider(ethereumProvider),
          ipfs: new IpfsClient({ host: 'localhost', port: '5001' })
        }
      }
    }

    link = withClientState({
      cache: new InMemoryCache(),
      resolvers: resolvers.resolvers
    })

  })

  it("Should add a new Token", async () => {

    await makePromise(
      execute(link, {
        query: gql`
          mutation addToken ($options: TokenOptions) {
            addToken(options: $options) @client {
              symbol
            } 
          }
        `,
        variables: {
          options: {
            symbol: 'test sym',
            description: 'test description',
            image: 'test image',
            decimals: 'test decimals'
          }
        },
        context: mockContext
      })
    )
  })

})