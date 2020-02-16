import { keccak256 } from 'js-sha3'
import { ethers, Contract, Signer, utils } from 'ethers'
import base from 'base-x'

import { signPermitNew } from './permit'

const DAI_PERMIT_TYPEHASH =
  'ea2aa0a1be11a07ed86d755c93467f4f82362b452371d1ba94d1715123511acb'
const offChainDataName = 'TokenData'
const maxValidity = 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'

//////////////////////////
///// ERC 1056 utils /////
//////////////////////////

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
    nonce = 1 // TODO - maybe cchange this to now be hard coded
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
    stringToBytes32(offChainDataName) +
    stripHexPrefix(metadataIpfsBytes) +
    maxValidity

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
    '0x' + stringToBytes32(offChainDataName),
    metadataIpfsBytes,
    '0x' + maxValidity,
    {
      gasLimit: 1000000,
      gasPrice: ethers.utils.parseUnits('1.0', 'gwei'),
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
    '0x' + stringToBytes32(offChainDataName),
    Buffer.from(metadataIpfsHash, 'hex'),
    '0x' + maxValidity,
  )
  return tx
}

//////////////////////////
//////// DAI utils ///////
//////////////////////////

export const daiPermit = async (
  holder: Signer,
  spenderAddress: string,
  daiContract: Contract,
  ethereum: ethers.providers.Web3Provider,
) => {
  const holderAddress = await holder.getAddress()
  const nonce = (await daiContract.nonces(holderAddress)).toString()
  const domain = {
    name: 'Dai Stablecoin',
    version: '1',
    chainId: '3',
    verifyingContract: '0x4dcC2886A94566B2688931Ad939fBA6c20B47e87',
  }

  const message = {
    holder: holderAddress,
    spender: spenderAddress,
    nonce,
    expiry: 0,
    allowed: true,
  }

  const stuff = await signPermitNew(ethereum, domain, message)

  console.log(stuff)
  const splitSig = ethers.utils.splitSignature(stuff.sig)

  // const sig = await signPermit(
  //   holderAddress,
  //   spenderAddress,
  //   holder,
  //   nonce,
  //   daiContract,
  //   ethereum,
  // )
  return splitSig
}

// export const signPermit = async (
//   holderAddress: string,
//   spenderAddress: string,
//   holder: Signer,
//   nonce: string,
//   daiContract: Contract,
//   ethereum: ethers.providers.Web3Provider,
// ) => {
//   const paddedNonce = leftPad(Buffer.from([nonce]).toString('hex'))
//   // We set expiry to 0 always, as that will be default for the TokenRegistry calling
//   const paddedExpiry = leftPad(Buffer.from([0]).toString('hex'))
//   // We set to 1 == true, as that will be default for the TokenRegistry calling
//   const paddedTrue = leftPad(Buffer.from([1]).toString('hex'))

//   const DAI_DOMAIN_SEPARATOR = await createDaiDomainSeparator(daiContract, ethereum)
//   const structEncoded =
//     DAI_PERMIT_TYPEHASH +
//     // abi.encode in solidity automatically removes the checksum, so we must use toLowerCase
//     leftPad(stripHexPrefix(holderAddress.toLowerCase())) +
//     leftPad(stripHexPrefix(spenderAddress.toLowerCase())) +
//     paddedNonce +
//     paddedExpiry +
//     paddedTrue

//   const hashedStruct = Buffer.from(
//     keccak256.arrayBuffer(Buffer.from(structEncoded, 'hex')),
//   )
//   const stringHashedStruct = hashedStruct.toString('hex')
//   const stringDomainSeparator = DAI_DOMAIN_SEPARATOR.toString('hex')
//   const digestData = '1901' + stringDomainSeparator + stringHashedStruct

//   // TODO: need to utilize "Sign Typed Data V4" here instead.
//   //       https://gitcoin.co/issue/MetaMask/Hackathons/2/3865
//   //       https://metamask.github.io/metamask-docs/API_Reference/Signing_Data/Sign_Typed_Data_v4
//   //       https://github.com/mosendo/gasless/blob/7688283021bbdb1c99b6951944345af0ba06e036/app/src/utils/relayer.js#L38-L79

//   /*  Expected digest value and first test deploy on ganache:
//       fc60391b0087e420dc8e15ae01ef93d0814572bbd80b3111248897d3a0d9f941
//   */
//   const digest = Buffer.from(keccak256(Buffer.from(digestData, 'hex')), 'hex')
//   // const signature = await holder.signMessage(digest)
//   // const splitSig = ethers.utils.splitSignature(signature)
//   // return {
//   //   r: splitSig.r,
//   //   s: splitSig.s,
//   //   v: splitSig.v,
//   // }

//   let sig = await ethereum.send('eth_signTypedData_v3', [holderAddress, digest])
//   console.log(sig)
//   return {
//     r: sig.r,
//     s: sig.s,
//     v: sig.v,
//   }
// }

// const createDaiDomainSeparator = async (
//   daiContract: Contract,
//   ethereum: ethers.providers.Web3Provider,
// ) => {
//   const domain = keccak256(
//     'EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)',
//   )
//   const daiName = 'Dai Stablecoin'
//   const daiVersion = '1'
//   const hashedName = keccak256(daiName)
//   const hashedVersion = keccak256(daiVersion)

//   // ChainID of uint256 9545 used for development, in bytes32
//   let chainID
//   const network = await ethereum.getNetwork()
//   const networkName = network.name
//   if (networkName == 'mainnet') {
//     chainID = 1
//   } else if (networkName == 'ropsten') {
//     chainID = 3
//   } else if (networkName == 'ganache') {
//     chainID = 9545
//   } else {
//     console.log('NO CHAIN ID, this will probably crash')
//   }
//   const paddedChainID = leftPad(chainID.toString(16))
//   const daiAddress = daiContract.address.toLowerCase()
//   const paddedDaiAddress = leftPad(stripHexPrefix(daiAddress))
//   const data = domain + hashedName + hashedVersion + paddedChainID + paddedDaiAddress
//   console.log('DAI DATA: ', data)
//   const hash = Buffer.from(keccak256.arrayBuffer(Buffer.from(data, 'hex')))
//   return hash
// }

//////////////////////////
///// Basic Helpers //////
//////////////////////////

const stripHexPrefix = (str: string) => {
  if (str.startsWith('0x')) {
    return str.slice(2)
  }
  return str
}

const leftPad = (data: string, size = 64) => {
  if (data.length === size) return data
  return '0'.repeat(size - data.length) + data
}

// convert ipfsHash to Hex string
export const ipfsHexHash = (ipfsHash: string) => {
  const base58 = base('123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz')
  return (
    '0x' +
    base58
      .decode(ipfsHash)
      .slice(2)
      .toString('hex')
  )
}

export const stringToBytes32 = str => {
  const buffstr = Buffer.from(str).toString('hex')
  return buffstr + '0'.repeat(64 - buffstr.length)
}
