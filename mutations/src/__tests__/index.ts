
import gql from 'graphql-tag'
import { BehaviorSubject } from 'rxjs'

import resolvers from '..'
import {
  getFromIpfs,
  TokenMetadata,
  ipfsClient,
  createApolloClient
} from './utils'

describe("Mutation Resolvers", () => {

  const observer = new BehaviorSubject<any>({} as any)

  const client = createApolloClient(
    resolvers.resolvers,
    resolvers.config,
    resolvers.stateBuilder
  )

  let addToken: any

  beforeAll(() => {
    observer.subscribe( value => {
      if(value.addToken){
        addToken = value.addToken
      }
    })
  })

  describe("addToken resolver", () => {

    it("Should upload image to IPFS and then metadata", async () => {

      let metadata: TokenMetadata, image: string;

      await client.mutate({
        mutation: gql`
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
            image: "test img",
            decimals: 'test decimals'
          }
        },
        context: {
          _rootSub: observer
        }
      })

      const metadataString = await getFromIpfs(ipfsClient, addToken.metadataHash)

      metadata = JSON.parse(metadataString)
      image = await getFromIpfs(ipfsClient, metadata.image)

      expect(metadata.symbol).toEqual('test sym')
      expect(image).toEqual('test img')

    })

  })

})