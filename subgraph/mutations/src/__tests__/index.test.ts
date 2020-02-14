import gql from 'graphql-tag'
import { BehaviorSubject } from 'rxjs'

import mutationsModule from '..'
import {
  getFromIpfs,
  TokenMetadata,
  ipfsClient,
  createApolloClient,
  provider,
} from './utils'

describe('Mutation Resolvers', () => {
  const observer = new BehaviorSubject<any>({} as any)

  const client = createApolloClient(mutationsModule)

  let publishedValue: any

  beforeAll(() => {
    observer.subscribe(value => {
      if (value) {
        publishedValue = value
      }
    })
  })

  describe('addToken resolver', () => {
    it('Should upload image to IPFS and then metadata', async () => {
      let metadata: TokenMetadata, image: string

      await client.mutate({
        mutation: gql`
          mutation addToken($options: TokenOptions) {
            addToken(options: $options) @client {
              metadataHash
            }
          }
        `,
        variables: {
          options: {
            symbol: 'test sym',
            description: 'test description',
            image: 'test img',
            decimals: 'test decimals',
          },
        },
        context: {
          _rootSub: observer,
        },
      })

      const metadataString = await getFromIpfs(
        ipfsClient,
        publishedValue.addToken.metadataHash,
      )

      metadata = JSON.parse(metadataString)
      image = await getFromIpfs(ipfsClient, metadata.image)

      expect(metadata.symbol).toEqual('test sym')
      expect(image).toEqual('test img')
    })
  })

  describe('removeToken resolver', () => {
    it('Should return true', async () => {
      const {
        data: { removeToken },
      } = await client.mutate({
        mutation: gql`
          mutation removeToken($tokenId: ID) {
            removeToken(tokenId: $tokenId) @client
          }
        `,
        variables: {
          tokenId: 'RandomID',
        },
        context: {
          _rootSub: observer,
        },
      })

      expect(removeToken).toEqual(true)
    })
  })

  describe('challengeToken resolver', () => {
    it('Should upload challenge data to IPFS', async () => {
      await client.mutate({
        mutation: gql`
          mutation challengeToken($options: ChallengeOptions!) {
            challengeToken(options: $options) @client
          }
        `,
        variables: {
          options: {
            description: 'test desc',
            challengingToken: '0x28644b4d1dd1995a21007222a9ec02fb2a4fa950',
            challengedToken: await provider.getSigner(0).getAddress(),
          },
        },
        context: {
          _rootSub: observer,
        },
      })

      const challengeString = await getFromIpfs(
        ipfsClient,
        publishedValue.challengeToken.challengeHash,
      )

      const challengeData = JSON.parse(challengeString)

      expect(challengeData.description).toEqual('test desc')
      expect(challengeData.token.symbol).toEqual('test sym')
    })
  })
})
