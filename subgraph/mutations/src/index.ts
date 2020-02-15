import {
  EventPayload,
  MutationContext,
  MutationResolvers,
  MutationState,
  StateBuilder,
} from '@graphprotocol/mutations'
import { ethers } from 'ethers'
import { AsyncSendable, Web3Provider } from 'ethers/providers'
import { applySignedWithAttribute, ipfsHexHash, setAttribute } from './utils'
import {
  AddTokenArguments,
  EditTokenArguments,
  RemoveTokenArguments,
  ChallengeTokenArguments,
  VoteChallengeArguments,
} from './types'
const ipfsHttpClient = require('ipfs-http-client')

interface UploadImageEvent extends EventPayload {
  value: boolean
}

interface UploadChallengeEvent extends EventPayload {
  challengeHash: string
}

interface UploadMetadataEvent extends EventPayload {
  metadataHash: string
}

type EventMap = {
  UPLOAD_IMAGE: UploadImageEvent
  UPLOAD_METADATA: UploadMetadataEvent
  UPLOAD_CHALLENGE: UploadChallengeEvent
}

interface State {
  imageUploaded: boolean
  metadataUploaded: boolean
  metadataHash: string
  challengeUploaded: boolean
  challengeHash: string
}

const stateBuilder: StateBuilder<State, EventMap> = {
  getInitialState(): State {
    return {
      imageUploaded: false,
      metadataUploaded: false,
      metadataHash: '',
      challengeUploaded: false,
      challengeHash: '',
    }
  },
  reducers: {
    UPLOAD_IMAGE: async (state: MutationState<State>, payload: UploadImageEvent) => {
      return {
        imageUploaded: payload.value,
      }
    },
    UPLOAD_METADATA: async (
      state: MutationState<State>,
      payload: UploadMetadataEvent,
    ) => {
      return {
        metadataUploaded: true,
        metadataHash: payload.metadataHash,
      }
    },
    UPLOAD_CHALLENGE: async (
      state: MutationState<State>,
      payload: UploadChallengeEvent,
    ) => {
      return {
        challengeUploaded: true,
        challengeHash: payload.challengeHash,
      }
    },
  },
}

const config = {
  ethereum: (provider: AsyncSendable): Web3Provider => {
    return new Web3Provider(provider)
  },
  ipfs: (endpoint: string) => {
    const url = new URL(endpoint)
    return ipfsHttpClient({
      protocol: url.protocol.replace(/[:]+$/, ''),
      host: url.hostname,
      port: url.port,
      'api-path': url.pathname.replace(/\/$/, '') + '/api/v0/',
    })
  },
}

type Config = typeof config

type Context = MutationContext<Config, State, EventMap>

const abis = {
  Context: require('token-registry-contracts/build/contracts/Context.json').abi,
  Dai: require('token-registry-contracts/build/contracts/Dai.json').abi,
  EthereumDIDRegistry: require('token-registry-contracts/build/contracts/EthereumDIDRegistry.json')
    .abi,
  LibNote: require('token-registry-contracts/build/contracts/LibNote.json').abi,
  Ownable: require('token-registry-contracts/build/contracts/Ownable.json').abi,
  Registry: require('token-registry-contracts/build/contracts/Registry.json').abi,
  ReserveBank: require('token-registry-contracts/build/contracts/ReserveBank.json').abi,
  SafeMath: require('token-registry-contracts/build/contracts/SafeMath.json').abi,
  TokenRegistry: require('token-registry-contracts/build/contracts/TokenRegistry.json')
    .abi,
}

console.log('FIND ME: ', abis.TokenRegistry)

const addresses = require('token-registry-contracts/addresses.json')

const addressMap = {
  Dai: 'mockDAI',
  EthereumDIDRegistry: 'ethereumDIDRegistry',
  ReserveBank: 'reserveBank',
  TokenRegistry: 'tokenRegistry',
}

async function getContract(context: Context, contract: string, signer: ethers.Signer) {
  const { ethereum } = context.graph.config

  const abi = abis[contract]

  if (!abi) {
    throw new Error(`Missing the ABI for '${contract}'`)
  }

  const network = await ethereum.getNetwork()
  let networkName = network.name

  if (networkName === 'dev' || networkName === 'unknown') {
    networkName = 'ganache'
  }

  const networkAddresses = addresses[networkName]

  if (!networkAddresses) {
    throw new Error(`Missing addresses for network '${networkName}'`)
  }

  const address = networkAddresses[addressMap[contract]]

  if (!address) {
    throw new Error(
      `Missing contract address for '${contract}' on network '${networkName}'`,
    )
  }

  const instance = new ethers.Contract(address, abi, signer)
  instance.connect(ethereum)

  return instance
}

async function uploadImage(_, { image }: any, context: Context) {
  const { ipfs } = context.graph.config

  return await uploadToIpfs(ipfs, image)
}

async function addToken(
  _,
  { symbol, description, image, decimals, address }: AddTokenArguments,
  context: Context,
) {
  const { ipfs, ethereum } = context.graph.config

  const { state } = context.graph

  const imageHash = await uploadToIpfs(ipfs, image)

  await state.dispatch('UPLOAD_IMAGE', { value: true })

  const metadata = Buffer.from(
    JSON.stringify({
      symbol,
      description,
      image: imageHash,
      decimals,
      address,
    }),
  )

  const metadataHash = await uploadToIpfs(ipfs, metadata)

  await state.dispatch('UPLOAD_METADATA', { metadataHash })

  const owner = ethereum.getSigner(0)
  const member = await ethers.Wallet.createRandom().connect(ethereum)

  // Used for raw signing of data, without x19Ethereum...
  const memberSigningKey = new ethers.utils.SigningKey(member.privateKey)

  // Dave - below makes a contract instance where a signer is already attacched
  const tokenRegistryContract = await getContract(context, 'TokenRegistry', owner)
  const ethereumDIDContract = await getContract(context, 'EthereumDIDRegistry', owner)
  const daiContract = await getContract(context, 'Dai', owner)

  try {
    await applySignedWithAttribute(
      member,
      memberSigningKey,
      owner,
      metadataHash,
      tokenRegistryContract,
      ethereumDIDContract,
      daiContract,
    )
  } catch (err) {
    console.log('TX err: ', err)
    throw err
  }

  return true
}

async function editToken(
  _,
  { symbol, description, image, decimals, address }: EditTokenArguments,
  context: Context,
) {
  const { ipfs, ethereum } = context.graph.config

  const imageHash = await uploadToIpfs(ipfs, image)

  const metadata = JSON.stringify({
    symbol,
    description,
    image: imageHash,
    decimals,
    address,
  })

  const metadataHash = await uploadToIpfs(ipfs, metadata)

  const owner = ethereum.getSigner(0)
  const member = await ethers.Wallet.createRandom().connect(ethereum)
  const memberAddress = await member.getAddress()

  const ethereumDIDRegistry = await getContract(context, 'EthereumDIDRegistry', member)

  try {
    await setAttribute(memberAddress, owner, metadataHash, ethereumDIDRegistry)
  } catch (err) {
    console.log(err)
    throw err
  }

  return true
}

async function removeToken(_, { tokenId }: RemoveTokenArguments, context: Context) {
  const { ethereum } = context.graph.config

  const owner = ethereum.getSigner(0)
  const tokenRegistry = await getContract(context, 'TokenRegistry', owner)

  try {
    await tokenRegistry.memberExit(tokenId.toString())
  } catch (err) {
    console.log(err)
    throw err
  }

  return true
}

async function challengeToken(
  _,
  {
    challengingTokenAddress,
    challengedTokenAddress,
    description,
  }: ChallengeTokenArguments,
  context: Context,
) {
  const { ipfs, ethereum } = context.graph.config
  const { state } = context.graph

  const challenge = JSON.stringify({
    description,
    challengedTokenAddress,
  })

  const challengeHash = await uploadToIpfs(ipfs, challenge)

  await state.dispatch('UPLOAD_CHALLENGE', { challengeHash })

  const tokenRegistry = await getContract(context, 'TokenRegistry', ethereum.getSigner())

  try {
    await tokenRegistry.challenge(
      challengingTokenAddress,
      challengedTokenAddress,
      ipfsHexHash(challengeHash),
    )
  } catch (err) {
    console.log(err)
    throw err
  }

  return true
}

async function voteChallenge(
  _,
  { challengeId, voteChoices, voters }: VoteChallengeArguments,
  context: Context,
) {
  const { ethereum } = context.graph.config

  const tokenRegistry = await getContract(context, 'TokenRegistry', ethereum.getSigner())

  try {
    await tokenRegistry.submitVotes(challengeId, voteChoices, voters)
  } catch (err) {
    console.log(err)
    throw err
  }

  return true
}

const uploadToIpfs = async (ipfs: any, data: any): Promise<string> => {
  let result

  for await (const returnedValue of ipfs.add(data)) {
    result = returnedValue
  }

  return result.path
}

const resolvers: MutationResolvers<Config, State, EventMap> = {
  Mutation: {
    uploadImage,
    addToken,
    editToken,
    removeToken,
    challengeToken,
    voteChallenge,
  },
}

export default {
  resolvers,
  config,
  stateBuilder,
}

export { State, EventMap, UploadImageEvent, UploadMetadataEvent }
