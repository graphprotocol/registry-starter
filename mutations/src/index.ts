import {
  EventPayload,
  MutationContext,
  MutationResolvers,
  MutationState,
  StateBuilder,
  StateUpdater,
} from "../mutations-package"
import { ethers, utils } from 'ethers'
import {
  AsyncSendable,
  Web3Provider
} from "ethers/providers"

import { changeOwnerSignedData, permitSignedData, setAttributeData, VALIDITY_TIMESTAMP, ipfsHexHash } from './utils'

const IpfsClient = require('ipfs-http-client')

interface UploadImageEvent extends EventPayload {
  value: boolean
}

interface UploadMetadataEvent extends EventPayload {
  metadataHash: string
}

type EventMap = {
  'UPLOAD_IMAGE': UploadImageEvent
  'UPLOAD_METADATA': UploadMetadataEvent
}

interface State {
  imageUploaded: boolean,
  metadataUploaded: boolean
  metadataHash: string
}

const stateBuilder: StateBuilder<State, EventMap> = {
  getInitialState(): State {
    return {
      imageUploaded: false,
      metadataUploaded: false,
      metadataHash: ''
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
    }
  }
}

const address = "0x970e8f18ebfEa0B08810f33a5A40438b9530FBCF"

const config = {
  ethereum: (provider: AsyncSendable): Web3Provider => {
    return new Web3Provider(provider)
  },
  ipfs: (endpoint: string) => {
    return new IpfsClient(endpoint)
  }
}

type Config = typeof config

type Context = MutationContext<Config, State, EventMap>

async function getContract(context: Context, name: string) {
  const abi = require(`../../contracts/build/contracts/${name}.json`).abi

  if (!abi || !address) {
    throw Error(`Missing the DataSource '${name}'`)
  }

  const { ethereum } = context.graph.config

  const contract = new ethers.Contract(
    address, abi, ethereum.getSigner ? ethereum.getSigner() : ethereum
  )
  contract.connect(ethereum)

  return contract
}

async function addToken(_, { options }: any, context: Context) {

  const { ipfs } = context.graph.config

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

  // const randomWallet = ethers.Wallet.createRandom() as any
  // const randomWalletAddress = randomWallet.signingKey.address
  // const offChainDataName =
  //   '0x50726f6a65637444617461000000000000000000000000000000000000000000'

  // const signedMessage1 = await randomWallet.signMessage(
  //   changeOwnerSignedData(randomWalletAddress, address),
  // )

  // const signedMessage2 = await randomWallet.signMessage(
  //   permitSignedData(randomWalletAddress, address),
  // )

  // const signedMessage3 = await randomWallet.signMessage(
  //   setAttributeData(
  //     randomWalletAddress,
  //     metadataHash,
  //     offChainDataName,
  //   ),
  // )

  // const sig1 = utils.splitSignature(signedMessage1)
  // const sig2 = utils.splitSignature(signedMessage2)
  // const sig3 = utils.splitSignature(signedMessage3)

  // let { v: v1, r: r1, s: s1 } = sig1
  // let { v: v2, r: r2, s: s2 } = sig2
  // let { v: v3, r: r3, s: s3 } = sig3

  // const tokenRegistry = await getContract(context, "TokenRegistry")

  // const transaction = await tokenRegistry.applySignedWithAttribute(
  //   randomWalletAddress,
  //   [v1, v2],
  //   [r1, r2],
  //   [s1, s2],
  //   address,
  //   v3,
  //   r3,
  //   s3,
  //   offChainDataName,
  //   ipfsHexHash(metadataHash),
  //   VALIDITY_TIMESTAMP,
  // )

  return null
}

async function editToken(_, { options }: any, context: Context) {

  const { ipfs } = context.graph.config

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

  const ethereumDIDRegistry = await getContract(context, "EthereumDIDRegistry")

  return null
}

const resolvers: MutationResolvers<Config, State, EventMap>= {
  Mutation: {
    addToken,
    editToken
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