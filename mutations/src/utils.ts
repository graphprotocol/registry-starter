import { keccak256 } from 'js-sha3'
import { ethers, Contract, Signer } from 'ethers'

const DAI_PERMIT_TYPEHASH = 'ea2aa0a1be11a07ed86d755c93467f4f82362b452371d1ba94d1715123511acb'
const offChainDataName = 'TokenData'
const maxValidity = 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'

export const setAttributeSigned = async (
  newMember: Signer,
  owner: Signer,
  data: string,
  ethDIDContract: Contract
) => {
  const memberAddress = await newMember.getAddress()
  const sig = await signDataDIDRegistry(
    memberAddress,
    owner,
    data,
    'setAttribute',
    ethDIDContract
  )
  return sig
}

export const daiPermit = async (
  holder: Signer,
  spenderAddress: string,
  daiContract: Contract
) => {
  const holderAddress = await holder.getAddress()
  const nonce = (await daiContract.nonces(holderAddress)).toString()
  const sig = await signPermit(
    holderAddress,
    spenderAddress,
    holder,
    nonce,
    daiContract
  )
  return sig
}

export const applySigned = async (
  newMember: Signer,
  owner: Signer,
  ethDIDContract: Contract
) => {
  const newMemberAddress = await newMember.getAddress()
  const ownerAddress = await owner.getAddress()

  const sig = await signDataDIDRegistry(
    newMemberAddress,
    newMember,
    Buffer.from('changeOwner').toString('hex') + stripHexPrefix(ownerAddress),
    'changeOwner',
    ethDIDContract
  )
  return sig
}

export const signDataDIDRegistry = async (
  identity: string,
  signer: Signer,
  data: string,
  functionName: string,
  ethDIDContract: Contract
) => {
  const nonce = await ethDIDContract.nonce(identity)
  const paddedNonce = leftPad(Buffer.from([nonce]).toString('hex'))
  let dataToSign

  if (functionName == 'changeOwner') {
    dataToSign =
      '1900' +
      stripHexPrefix(ethDIDContract.address) +
      paddedNonce +
      stripHexPrefix(identity) +
      data
  } else if (functionName == 'setAttribute') {
    dataToSign =
      '1900' +
      stripHexPrefix(ethDIDContract.address) +
      paddedNonce +
      stripHexPrefix(identity) +
      data
  }

  const hash = Buffer.from(keccak256.arrayBuffer(Buffer.from(dataToSign, 'hex')))
  const signature = await signer.signMessage(hash)
  const splitSig = ethers.utils.splitSignature(signature)

  return {
    r: splitSig.r,
    s: splitSig.s,
    v: splitSig.v
  }
}

export const signPermit = async (
  holderAddress: string,
  spenderAddress: string,
  holder: Signer,
  nonce: string,
  daiContract: Contract
) => {
  const paddedNonce = leftPad(Buffer.from([nonce]).toString('hex'))
  // We set expiry to 0 always, as that will be default for the TokenRegistry calling
  const paddedExpiry = leftPad(Buffer.from([0]).toString('hex'))
  // We set to 1 == true, as that will be default for the TokenRegistry calling
  const paddedTrue = leftPad(Buffer.from([1]).toString('hex'))

  /*  Expected DAI_DOMAIN_SEPARATOR value on first test deploy (dependant on mock dai addr):
      Where mock dai addr = 0xCfEB869F69431e42cdB54A4F4f105C19C080A601 :
      0xcf69a4130104a154c155546e3966369c03a442bdff846f0bc1aae6f9e9a3b68f
  */
  const DAI_DOMAIN_SEPARATOR = await createDaiDomainSeparator(daiContract)

  /*  Expected structEncoded value on first test run (dependant on mock dai address)
      Where mock dai addr = 0xCfEB869F69431e42cdB54A4F4f105C19C080A601
      (note all are concatenated, spaces are for readability)
      Note we do not have 0x at the front of the byte string: 

      ea2aa0a1be11a07ed86d755c93467f4f82362b452371d1ba94d1715123511acb
      000000000000000000000000ffcf8fdee72ac11b5c542428b35eef5769c409f
      000000000000000000000000290fb167208af455bb137780163b7b7a9a10c16
      0000000000000000000000000000000000000000000000000000000000000000
      0000000000000000000000000000000000000000000000000000000000000000
      0000000000000000000000000000000000000000000000000000000000000001 
  */
  const structEncoded =
    DAI_PERMIT_TYPEHASH +
    // abi.encode in solidity automatically removes the checksum, so we must use toLowerCase
    leftPad(stripHexPrefix(holderAddress.toLowerCase())) +
    leftPad(stripHexPrefix(spenderAddress.toLowerCase())) +
    paddedNonce +
    paddedExpiry +
    paddedTrue

  /*  Expected hashedStruct value:
      01b930e8948f5be49f019425c83bcf1657b07efb06fb959192051e9c412abace
  */
  const hashedStruct = Buffer.from(keccak256.arrayBuffer(Buffer.from(structEncoded, 'hex')))
  const stringHashedStruct = hashedStruct.toString('hex')
  const stringDomainSeparator = DAI_DOMAIN_SEPARATOR.toString('hex')

  /*  Expected digestData value on first test run (dependant on mock dai address)
      Where mock dai addr = 0xCfEB869F69431e42cdB54A4F4f105C19C080A601
      (note all are concatenated, spaces are for readability)
      Note we do not have 0x at the front of the byte string: 

      1901
      cf69a4130104a154c155546e3966369c03a442bdff846f0bc1aae6f9e9a3b68f
      01b930e8948f5be49f019425c83bcf1657b07efb06fb959192051e9c412abace
  */
  const digestData = '1901' + stringDomainSeparator + stringHashedStruct

  /*  Expected digest value and first test deploy on ganache:
      fc60391b0087e420dc8e15ae01ef93d0814572bbd80b3111248897d3a0d9f941
  */
  const digest = Buffer.from(keccak256.arrayBuffer(Buffer.from(digestData, 'hex')))
  const signature = await holder.signMessage(digest)
  const splitSig = ethers.utils.splitSignature(signature)
  return {
    r: splitSig.r,
    s: splitSig.s,
    v: splitSig.v
  }
}

export const stringToBytes32 = str => {
  const buffstr = Buffer.from(str).toString('hex')
  return buffstr + '0'.repeat(64 - buffstr.length)
}

export const applySignedWithAttribute = async (
  newMember: Signer,
  owner: Signer,
  metadataIpfsHash: string,
  tokenRegistryContract: Contract,
  ethDIDContract: Contract,
  daiContract: Contract
) => {

  const ownerAddress = await owner.getAddress()
  const memberAddress = await newMember.getAddress()

  // Get the signature for changing ownership on ERC-1056 Registry
  const applySignedSig = await applySigned(newMember, owner, ethDIDContract)

  // Get the signature for permitting TokenRegistry to transfer DAI on users behalf
  const permitSig = await daiPermit(owner, tokenRegistryContract.address, daiContract)

  const setAttributeData =
    Buffer.from('setAttribute').toString('hex') +
    stringToBytes32(offChainDataName) +
    stripHexPrefix(metadataIpfsHash) +
    maxValidity

  // Get the signature for setting the attribute (i.e. Token data) on ERC-1056
  const setAttributeSignedSig = await setAttributeSigned(
    newMember,
    owner,
    setAttributeData,
    ethDIDContract
  )

  // Send all three meta transactions to TokenRegistry to be executed in one tx
  const tx = await tokenRegistryContract.applySignedWithAttribute(
    memberAddress,
    [applySignedSig.v, permitSig.v],
    [applySignedSig.r, permitSig.r],
    [applySignedSig.s, permitSig.s],
    ownerAddress,
    setAttributeSignedSig.v,
    setAttributeSignedSig.r,
    setAttributeSignedSig.s,
    '0x' + stringToBytes32(offChainDataName),
    Buffer.from(metadataIpfsHash),
    '0x' + maxValidity
  )
}

export const setAttribute = async (
  memberAddress: string,
  owner: Signer,
  metadataIpfsHash: string,
  ethDIDContract: Contract
) => {
  const fromOwner = new ethers.Contract(
    ethDIDContract.address,
    ethDIDContract.interface,
    owner
  )
  const tx = await fromOwner.setAttribute(
    memberAddress,
    '0x' + stringToBytes32(offChainDataName),
    metadataIpfsHash,
    '0x' + maxValidity
  )
  return tx
}

const createDaiDomainSeparator = async (daiContract: Contract) => {
  const domain = keccak256(
    'EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)'
  )
  const daiName = 'Dai Stablecoin'
  const daiVersion = '1'
  const hashedName = keccak256(daiName)
  const hashedVersion = keccak256(daiVersion)

  // ChainID of uint256 9545 used for development, in bytes32
  const paddedChainID = '000000000000000000000000000000000000000000000000000000000000267e'
  const daiAddress = daiContract.address
  const paddedDaiAddress = leftPad(stripHexPrefix(daiAddress))
  const data = domain + hashedName + hashedVersion + paddedChainID + paddedDaiAddress
  const hash = Buffer.from(keccak256.arrayBuffer(Buffer.from(data, 'hex')))
  return hash
}

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
