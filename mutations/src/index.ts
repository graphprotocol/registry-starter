import {
  EventPayload,
  MutationContext,
  MutationResolvers,
  MutationState,
  StateBuilder
} from '../@graphprotocol/mutations'
import { ethers } from 'ethers'
import {
  AsyncSendable,
  Web3Provider
} from "ethers/providers"
import { applySignedWithAttribute, setAttribute } from './utils'
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
  'UPLOAD_IMAGE': UploadImageEvent
  'UPLOAD_METADATA': UploadMetadataEvent
  'UPLOAD_CHALLENGE': UploadChallengeEvent
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
      challengeHash: ''
    }
  },
  reducers: {
    'UPLOAD_IMAGE': async (state: MutationState<State>, payload: UploadImageEvent) => {
      return {
        imageUploaded: payload.value
      }
    },
    'UPLOAD_METADATA': async (state: MutationState<State>, payload: UploadMetadataEvent) => {
      return {
        metadataUploaded: true,
        metadataHash: payload.metadataHash
      }
    },
    'UPLOAD_CHALLENGE': async (state: MutationState<State>, payload: UploadChallengeEvent) => {
      return {
        challengeUploaded: true,
        challengeHash: payload.challengeHash
      }
    }
  }
}

const mnemonic = "myth like bonus scare over problem client lizard pioneer submit female collect"
const accountPath = "m/44'/60'/0'/0/"

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
  }
}

type Config = typeof config

type Context = MutationContext<Config, State, EventMap>

const abis = {
  Context: require('../../contracts/build/contracts/Context.json').abi,
  Dai: require('../../contracts/build/contracts/Dai.json').abi,
  EthereumDIDRegistry: require('../../contracts/build/contracts/EthereumDIDRegistry.json').abi,
  LibNote: require('../../contracts/build/contracts/LibNote.json').abi,
  Ownable: require('../../contracts/build/contracts/Ownable.json').abi,
  Registry: require('../../contracts/build/contracts/Registry.json').abi,
  ReserveBank: require('../../contracts/build/contracts/ReserveBank.json').abi,
  SafeMath: require('../../contracts/build/contracts/SafeMath.json').abi,
  TokenRegistry: require('../../contracts/build/contracts/TokenRegistry.json').abi
}

const addressMap = {
  Dai: "mockDAI",
  EthereumDIDRegistry: "ethereumDIDRegistry",
  ReserveBank: "reserveBank",
  TokenRegistry: "tokenRegistry",
}

const addressesByNetwork = require('../../contracts/addresses.json')

async function getContract(context: Context, contract: string, signer: ethers.Signer) {
  const { ethereum } = context.graph.config

  const abi = abis[contract]

  if (!abi) {
    throw new Error(`Missing the ABI for '${contract}'`)
  }

  const network = "dev" //ethereum.network.name
  const addresses = addressesByNetwork[network]

  if (!addresses) {
    throw new Error(`Missing addresses for network '${network}'`)
  }

  const addressName = addressMap[contract]

  if(!addressName) {
    throw new Error(`Missing address name mapping for '${contract}'`)
  }

  const address = addresses[addressName]

  if(!address) {
    throw new Error(`Missing address for '${addressName}'`)
  }

  const instance = new ethers.Contract(
    address, abi, ethereum.getSigner()
  )
  instance.connect(ethereum)

  return instance
}

async function addToken(_, { options }: any, context: Context) {

  const { ipfs, ethereum } = context.graph.config

  const { state } = context.graph

  const { symbol, description, image, decimals } = options

  const { path: imageHash }: { path: string } = await uploadToIpfs(ipfs, image)
  
  await state.dispatch("UPLOAD_IMAGE", { value: true })

  const metadata = JSON.stringify(
    {
      symbol,
      description,
      image: imageHash,
      decimals
    }
  )

  const { path: metadataHash }: { path: string } = await uploadToIpfs(ipfs, metadata)

  await state.dispatch("UPLOAD_METADATA", { metadataHash })

  const memberWallet = await ethers.Wallet.fromMnemonic(mnemonic, accountPath + "0").connect(ethereum)
  const ownerWallet = await ethers.Wallet.fromMnemonic(mnemonic, accountPath+ "1").connect(ethereum)

  const tokenRegistryContract = await getContract(context, "TokenRegistry", ownerWallet)
  const ethereumDIDContract = await getContract(context, "EthereumDIDRegistry", ownerWallet)

  const daiContract = await getContract(context, "Dai", ownerWallet)

  try{
    await applySignedWithAttribute(
      memberWallet,
      ownerWallet,
      tokenRegistryContract,
      ethereumDIDContract,
      daiContract
    )
  }catch(err) {
    console.log(err)
  }

}

async function editToken(_, { options }: any, context: Context) {

  const { ipfs, ethereum } = context.graph.config

  const { symbol, description, image, decimals } = options

  const { path: imageHash }: { path: string } = await uploadToIpfs(ipfs, image)

  const metadata = JSON.stringify(
    {
      symbol,
      description,
      image: imageHash,
      decimals
    }
  )

  const { path: metadataHash }: { path: string } = await uploadToIpfs(ipfs, metadata)
  
  const ownerWallet = await ethers.Wallet.fromMnemonic(mnemonic, accountPath + "1").connect(ethereum)
  const memberWallet = await ethers.Wallet.fromMnemonic(mnemonic, accountPath + "0").connect(ethereum)

  const memberAddress = await memberWallet.getAddress()

  const ethereumDIDRegistry = await getContract(context, "EthereumDIDRegistry", memberWallet)

  try{
    await setAttribute(memberAddress, ownerWallet, ethereumDIDRegistry)
  }catch(err) {
    console.log(err)
  }
  
  return null
}

async function deleteToken(_, args: any, context: Context) {

  const { ethereum } = context.graph.config

  const memberWallet = await ethers.Wallet.fromMnemonic(mnemonic, accountPath + 0).connect(ethereum)

  const tokenRegistry = await getContract(context, "TokenRegistry", memberWallet)

  const address = await memberWallet.getAddress()

  try{
    await tokenRegistry.memberExit(address)
  }catch(err){
    console.log(err)
  }

  return true
}

async function challengeToken(_, { options: { description, token } }: any, context: Context) {

  const { ipfs, ethereum } = context.graph.config

  const { state } = context.graph

  const challenge = JSON.stringify({
    description,
    token
  })

  const { path: challengeHash }: { path: string } = await uploadToIpfs(ipfs, challenge)

  await state.dispatch('UPLOAD_CHALLENGE', { challengeHash })

  const tokenRegistry = await getContract(context, "TokenRegistry", ethereum.getSigner())
  
  //tokenRegistry.challenge( ... )

  return true
}

async function voteChallenge(_, args: any, context: Context) {

  const { ethereum } = context.graph.config

  const tokenRegistry = await getContract(context, "TokenRegistry", ethereum.getSigner())
  
  //tokenRegistry.submitVotes( ... )

  return true
}



const resolvers: MutationResolvers<Config, State, EventMap>= {
  Mutation: {
    addToken,
    editToken,
    deleteToken,
    challengeToken,
    voteChallenge
  }
}

export default {
  resolvers,
  config,
  stateBuilder
}

export {
  State,
  EventMap,
  UploadImageEvent,
  UploadMetadataEvent
}

const uploadToIpfs = async (ipfs: any, element: string) => {
  let result;

  for await (const returnedValue of ipfs.add(element)) {
    result = returnedValue
  }

  return result
}