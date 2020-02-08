import HDWalletProvider from '@truffle/hdwallet-provider'
import { Web3Provider } from 'ethers/providers'
import gql from 'graphql-tag'
import {
  execute,
  makePromise
} from 'apollo-link'
import { withClientState } from 'apollo-link-state'
import { InMemoryCache } from 'apollo-cache-inmemory'

import resolvers from '..'

const IpfsClient = require('ipfs-http-client')
interface TokenMetadata {
  symbol: string,
  description: string
  image: string,
  decimals: string
}

describe("Mutation Resolvers", () => {

  const imageBuffer = "testImageBuffer"
  const ipfsClient = new IpfsClient({ host: 'localhost', port: '5001' })
  const ethereumProvider = new HDWalletProvider(
    "0xb0057716d5917badaf911b193b12b910811c1497b5bada8d7711f758981c3773",
    "http://localhost:8545"
  )
  const mockContext = {
    graph: {
      config: {
        ethereum: new Web3Provider(ethereumProvider),
        ipfs: new IpfsClient({ host: 'localhost', port: '5001' })
      }
    }
  }
  const link = withClientState({
    cache: new InMemoryCache(),
    resolvers: resolvers.resolvers
  })

  describe("addToken resolver", () => {

    it("Should upload image to IPFS and then metadata", async () => {

      let metadata: TokenMetadata, image: string;

      const { data: { addToken } } = await makePromise(
        execute(link, {
          query: gql`
            mutation addToken ($options: TokenOptions) {
              addToken(options: $options) @client {
                metadataHash
              } 
            }
          `,
          variables: {
            options: {
              symbol: 'test sym',
              description: 'test description',
              image: imageBuffer,
              decimals: 'test decimals'
            }
          },
          context: mockContext
        })
      )

      for await (const result of ipfsClient.get(addToken.metadataHash)) {
        for await (const content of result.content as Buffer) {
          metadata = JSON.parse(content.toString())
        }
      }

      for await (const result of ipfsClient.get(metadata.image)) {
        for await (const content of result.content as Buffer) {
          image = content.toString()
        }
      }

      expect(metadata.symbol).toEqual('test sym')
      expect(image).toEqual('testImageBuffer')

    })

  })

})