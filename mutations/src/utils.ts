import { keccak256 } from 'js-sha3'
import { ecsign } from 'ethereumjs-util'

const DAI_PERMIT_TYPEHASH = 'ea2aa0a1be11a07ed86d755c93467f4f82362b452371d1ba94d1715123511acb'
const offChainDataName = 'TokenData'
const maxValidity = 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
const mockIPFSData = '0xbabbabb9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9'

export const setAttributeSigned = async (newMemberWallet, ownerWallet, data, ethDIDContract) => {
  const memberAddress = newMemberWallet.signingKey.address
  const ownerPrivateKey = Buffer.from(
    stripHexPrefix(ownerWallet.signingKey.privateKey),
    'hex'
  )
  const sig = await signDataDIDRegistry(
    memberAddress,
    ownerPrivateKey,
    data,
    'setAttribute',
    ethDIDContract
  )
  return sig
}

export const daiPermit = async (holderWallet, spenderAddress, daiContract) => {
  const holderAddress = holderWallet.signingKey.address
  const nonce = (await daiContract.nonces(holderAddress)).toString()
  const holderPrivateKey = Buffer.from(
    stripHexPrefix(holderWallet.signingKey.privateKey),
    'hex'
  )
  const sig = await signPermit(
    holderAddress,
    spenderAddress,
    holderPrivateKey,
    nonce,
    daiContract
  )
  return sig
}

export const applySigned = async (newMemberWallet, ownerWallet, ethDIDContract) => {
  const memberAddress = newMemberWallet.signingKey.address
  const memberPrivateKey = Buffer.from(
    stripHexPrefix(newMemberWallet.signingKey.privateKey),
    'hex'
  )

  const ownerAddress = ownerWallet.signingKey.address
  const sig = await signDataDIDRegistry(
    memberAddress,
    memberPrivateKey,
    Buffer.from('changeOwner').toString('hex') + stripHexPrefix(ownerAddress),
    'changeOwner',
    ethDIDContract
  )
  return sig
}

export const signDataDIDRegistry = async (identity, signingKey, data, functionName, ethDIDContract) => {
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
  console.log("PREV")
  const hash = Buffer.from(keccak256.arrayBuffer(Buffer.from(dataToSign, 'hex')))

  console.log("BEFORE ")
  const signature = ecsign(hash, signingKey)

  console.log("AFTER ")

  return {
    r: '0x' + signature.r.toString('hex'),
    s: '0x' + signature.s.toString('hex'),
    v: signature.v
  }
}

export const signPermit = async (holderAddress, spenderAddress, holderPrivateKey, nonce, daiContract) => {
  const paddedNonce = leftPad(Buffer.from([nonce]).toString('hex'))
  console.log("PADDED NONCE: ", paddedNonce)
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
  console.log("STRUCT ENCODED: ", structEncoded)
  const hashedStruct = Buffer.from(keccak256.arrayBuffer(Buffer.from(structEncoded, 'hex')))
  const stringHashedStruct = hashedStruct.toString('hex')
  console.log("HASHES STRUCT: ", stringHashedStruct)

  const stringDomainSeparator = DAI_DOMAIN_SEPARATOR.toString('hex')
  console.log("Domain Separator: ", stringDomainSeparator)


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
  console.log("DIGESt: ", digest.toString('hex'))

  const signature = ecsign(digest, holderPrivateKey)
  return {
    r: '0x' + signature.r.toString('hex'),
    s: '0x' + signature.s.toString('hex'),
    v: signature.v
  }
}

export const stringToBytes32 = str => {
  const buffstr = Buffer.from(str).toString('hex')
  return buffstr + '0'.repeat(64 - buffstr.length)
}

export const applySignedWithAttribute = async (newMemberWallet,
  ownerWallet,
  tokenRegistryContract,
  ethDIDContract,
  daiContract
) => {

  const ownerAddress = ownerWallet.signingKey.address
  const memberAddress = newMemberWallet.signingKey.address

  console.log("HERE")

  // Get the signature for changing ownership on ERC-1056 Registry
  const applySignedSig = await applySigned(newMemberWallet, ownerWallet, ethDIDContract)

  console.log("FIRST")

  // Get the signature for permitting TokenRegistry to transfer DAI on users behalf
  const permitSig = await daiPermit(ownerWallet, tokenRegistryContract.address, daiContract)

  console.log("SECOND")

  const setAttributeData =
    Buffer.from('setAttribute').toString('hex') +
    stringToBytes32(offChainDataName) +
    stripHexPrefix(mockIPFSData) +
    maxValidity
  // Get the signature for setting the attribute (i.e. Token data) on ERC-1056
  const setAttributeSignedSig = await setAttributeSigned(
    newMemberWallet,
    ownerWallet,
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
    mockIPFSData,
    '0x' + maxValidity
  )

  console.log(tx.receipt.rawLogs)

}

export const setAttribute = async (memberAddress, ownerWallet, ethDIDContract) => {
  const ownerAddress = ownerWallet.signingKey.address
  const tx = await ethDIDContract.setAttribute(
      memberAddress,
      '0x' + stringToBytes32(offChainDataName),
      mockIPFSData,
      '0x' + maxValidity
  )

}

const createDaiDomainSeparator = async (daiContract) => {
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
  console.log("DAI ADDR: ", daiAddress)
  const paddedDaiAddress = leftPad(stripHexPrefix(daiAddress))
  const data = domain + hashedName + hashedVersion + paddedChainID + paddedDaiAddress
  const hash = Buffer.from(keccak256.arrayBuffer(Buffer.from(data, 'hex')))
  return hash
}


const stripHexPrefix = str => {
  if (str.startsWith('0x')) {
    return str.slice(2)
  }
  return str
}

const leftPad = (data, size = 64) => {
  if (data.length === size) return data
  return '0'.repeat(size - data.length) + data
}
