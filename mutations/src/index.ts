const IpfsClient = require('ipfs-http-client')

import { ethers, utils } from 'ethers'
import {
  AsyncSendable,
  Web3Provider
} from "ethers/providers"

import { changeOwnerSignedData, permitSignedData, setAttributeData, VALIDITY_TIMESTAMP, ipfsHexHash } from './utils'

const address = "0xFC628dd79137395F3C9744e33b1c5DE554D94882"

const config = {
  ethereum: (provider: AsyncSendable): Web3Provider => {
    return new Web3Provider(provider)
  },
  ipfs: (endpoint: string) => {
    return new IpfsClient(endpoint)
  }
}

async function getTokenRegistryContract(context: any) {
  const abi = require("../../contracts/build/contracts/TokenRegistry.json").abi

  if (!abi || !address) {
    throw Error(`Missing the DataSource 'TokenRegistry'`)
  }

  const { ethereum } = context.graph.config

  const contract = new ethers.Contract(
    address, abi, ethereum.getSigner ? ethereum.getSigner() : ethereum
  )
  contract.connect(ethereum)

  return contract
}

async function addToken(_, { options }: any, context: any) {

  let metadataHash: string, imageHash: string

  const { ipfs } = context.graph.config

  const { symbol, description, image, decimals } = options

  for await (const result of ipfs.add(image)) {
    imageHash = `/ipfs/${result.path}`
  }

  const metadata = JSON.stringify(
    {
      symbol,
      description,
      image: imageHash,
      decimals
    }
  )

  for await (const result of ipfs.add(metadata)) {
    metadataHash = result.path
  }

  const randomWallet = ethers.Wallet.createRandom() as any
  const randomWalletAddress = randomWallet.signingKey.address
  const offChainDataName =
    '0x50726f6a65637444617461000000000000000000000000000000000000000000'

  const signedMessage1 = await randomWallet.signMessage(
    changeOwnerSignedData(randomWalletAddress, address),
  )

  const signedMessage2 = await randomWallet.signMessage(
    permitSignedData(randomWalletAddress, address),
  )

  const signedMessage3 = await randomWallet.signMessage(
    setAttributeData(
      randomWalletAddress,
      metadataHash,
      offChainDataName,
    ),
  )

  const sig1 = utils.splitSignature(signedMessage1)
  const sig2 = utils.splitSignature(signedMessage2)
  const sig3 = utils.splitSignature(signedMessage3)

  let { v: v1, r: r1, s: s1 } = sig1
  let { v: v2, r: r2, s: s2 } = sig2
  let { v: v3, r: r3, s: s3 } = sig3

  const tokenRegistry = await getTokenRegistryContract(context)

  const transaction = await tokenRegistry.applySignedWithAttribute(
    randomWalletAddress,
    [v1, v2],
    [r1, r2],
    [s1, s2],
    address,
    v3,
    r3,
    s3,
    offChainDataName,
    ipfsHexHash(metadataHash),
    VALIDITY_TIMESTAMP,
  )

  return {
    metadataHash
  };
}

const resolvers = {
  Mutation: {
    addToken
  }
}

export default {
  resolvers,
  config
}