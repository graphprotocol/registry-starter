import { keccak256 } from 'js-sha3'
import { ethers, Contract, Signer, utils } from 'ethers'

import { daiPermit } from './daiPermit'
import { config } from '../config'
import { leftPad, stringToBytes32, stripHexPrefix, ipfsHexHash } from './helpers'

//////////////////////////
///// ERC 1056 utils /////
//////////////////////////

export const setAttribute = async (
  memberAddress: string,
  owner: Signer,
  metadataIpfsHash: string,
  ethDIDContract: Contract,
) => {
  const fromOwner = new ethers.Contract(
    ethDIDContract.address,
    ethDIDContract.interface,
    owner,
  )
  const tx = await fromOwner.setAttribute(
    memberAddress,
    '0x' + stringToBytes32(config.offChainDataName),
    Buffer.from(metadataIpfsHash, 'hex'),
    '0x' + config.maxValidity,
  )
  return tx
}

export const setAttributeSigned = async (
  newMember: Signer,
  owner: Signer,
  data: string,
  ethDIDContract: Contract,
  rawSigner: utils.SigningKey,
) => {
  const memberAddress = await newMember.getAddress()
  const sig = await signDataDIDRegistry(
    memberAddress,
    owner,
    data,
    'setAttribute',
    ethDIDContract,
    rawSigner,
  )
  return sig
}

export const applySigned = async (
  newMember: Signer,
  owner: Signer,
  ethDIDContract: Contract,
  rawSigner: utils.SigningKey,
) => {
  const newMemberAddress = await newMember.getAddress()
  const ownerAddress = await owner.getAddress()

  const sig = await signDataDIDRegistry(
    newMemberAddress,
    newMember,
    Buffer.from('changeOwner').toString('hex') + stripHexPrefix(ownerAddress),
    'changeOwner',
    ethDIDContract,
    rawSigner,
  )
  return sig
}

export const signDataDIDRegistry = async (
  identity: string,
  signer: Signer,
  data: string,
  functionName: string,
  ethDIDContract: Contract,
  rawSigner: utils.SigningKey,
) => {
  let nonce = await ethDIDContract.nonce(identity) // ** need to add 1 TODO*
  if (functionName == 'changeOwner') {
    nonce = 1
  }
  const paddedNonce = leftPad(Buffer.from([nonce], 64).toString('hex'))
  let dataToSign

  if (functionName == 'changeOwner') {
    dataToSign =
      '1900' +
      stripHexPrefix(ethDIDContract.address) +
      paddedNonce +
      stripHexPrefix(identity.toLowerCase()) +
      data
  } else if (functionName == 'setAttribute') {
    dataToSign =
      '1900' +
      stripHexPrefix(ethDIDContract.address) +
      paddedNonce +
      stripHexPrefix(identity.toLowerCase()) +
      data
  }

  const hash = Buffer.from(keccak256(Buffer.from(dataToSign, 'hex')), 'hex')
  let splitSig = rawSigner.signDigest(hash)

  return {
    r: splitSig.r,
    s: splitSig.s,
    v: splitSig.v,
  }
}

export const applySignedWithAttribute = async (
  newMember: Signer,
  newMemberSigningKey: utils.SigningKey,
  owner: Signer,
  metadataIpfsHash: string,
  tokenRegistryContract: Contract,
  ethDIDContract: Contract,
  daiContract: Contract,
  ethereum: ethers.providers.Web3Provider,
) => {
  const ownerAddress = await owner.getAddress()
  const memberAddress = await newMember.getAddress()

  // Get the signature for changing ownership on ERC-1056 Registry
  const applySignedSig = await applySigned(
    newMember,
    owner,
    ethDIDContract,
    newMemberSigningKey,
  )

  // Get the signature for permitting TokenRegistry to transfer DAI on users behalf
  const permitSig = await daiPermit(
    owner,
    tokenRegistryContract.address,
    daiContract,
    ethereum,
  )

  const metadataIpfsBytes = ipfsHexHash(metadataIpfsHash)

  const setAttributeData =
    Buffer.from('setAttribute').toString('hex') +
    stringToBytes32(config.offChainDataName) +
    stripHexPrefix(metadataIpfsBytes) +
    config.maxValidity

  // Get the signature for setting the attribute (i.e. Token data) on ERC-1056
  const setAttributeSignedSig = await setAttributeSigned(
    newMember,
    owner,
    setAttributeData,
    ethDIDContract,
    newMemberSigningKey,
  )

  // Send all three meta transactions to TokenRegistry to be executed in one tx
  const tx = await tokenRegistryContract.applySignedWithAttributeAndPermit(
    memberAddress,
    [setAttributeSignedSig.v, applySignedSig.v, permitSig.v],
    [setAttributeSignedSig.r, applySignedSig.r, permitSig.r],
    [setAttributeSignedSig.s, applySignedSig.s, permitSig.s],
    ownerAddress,
    '0x' + stringToBytes32(config.offChainDataName),
    metadataIpfsBytes,
    '0x' + config.maxValidity,
    {
      gasLimit: 1000000,
      gasPrice: ethers.utils.parseUnits('25.0', 'gwei'),
    },
  )
  console.log('TRANSACTION: ', tx)
  tx.wait()
    .then(res => {
      console.log('SUCCESS: ', res)
    })
    .catch(e => console.error('TRANSACTION: ', e))

  return tx
}
