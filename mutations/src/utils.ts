import { ethers, utils } from 'ethers'
import base from 'base-x'

const ETHEREUM_DID_REGISTRY = '0xdca7ef03e98e0dc2b855be647c39abe984fcf21b'

export const VALIDITY_TIMESTAMP = 3156895760

export const changeOwnerSignedData = (projectId, owner) => {
  return ethers.utils.solidityKeccak256(
    ['bytes1', 'bytes1', 'address', 'uint256', 'address', 'string', 'address'],
    ['0x19', '0x0', ETHEREUM_DID_REGISTRY, 0, projectId, 'changeOwner', owner],
  )
}

export const permitSignedData = (projectId, owner) =>
  utils.solidityKeccak256(
    ['bytes1', 'bytes1', 'address', 'address', 'uint256', 'uint256', 'bool'],
    [
      '0x19',
      '0x0',
      projectId,
      owner,
      1, // nonce always starts at 1
      0, // allowance never expires
      true, // to represent an infinite amount of allowance
    ],
  )

export const setAttributeData = (projectId, ipfsHash, offChainDataName) => {
  return utils.solidityKeccak256(
    [
      'bytes1',
      'bytes1',
      'address',
      'uint256',
      'address',
      'string',
      'bytes32',
      'bytes',
      'uint256',
    ],
    [
      '0x19',
      '0x0',
      ETHEREUM_DID_REGISTRY,
      0,
      projectId, // project address
      'setAttribute',
      offChainDataName,
      ipfsHexHash(ipfsHash),
      VALIDITY_TIMESTAMP,
    ],
  )
}

export const ipfsHexHash = ipfsHash => {
  const base58 = base(
    '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz',
  )
  return (
    '0x' +
    base58
      .decode(ipfsHash)
      .slice(2)
      .toString('hex')
  )
}