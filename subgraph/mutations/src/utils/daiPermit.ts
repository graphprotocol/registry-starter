import { ethers, Contract, Signer } from 'ethers'
import { config } from '../config'

//////////////////////////
//////// DAI utils ///////
//////////////////////////

const domainSchema = [
  { name: 'name', type: 'string' },
  { name: 'version', type: 'string' },
  { name: 'chainId', type: 'uint256' },
  { name: 'verifyingContract', type: 'address' },
]

const permitSchema = [
  { name: 'holder', type: 'address' },
  { name: 'spender', type: 'address' },
  { name: 'nonce', type: 'uint256' },
  { name: 'expiry', type: 'uint256' },
  { name: 'allowed', type: 'bool' },
]

async function signPermit(provider, domain, message) {
  let signer = provider.getSigner()
  let myAddr = await signer.getAddress()

  if (myAddr.toLowerCase() !== message.holder.toLowerCase()) {
    throw `signPermit: address of signer does not match holder address in message`
  }

  if (message.nonce === undefined) {
    let tokenAbi = ['function nonces(address holder) view returns (uint)']

    let tokenContract = new ethers.Contract(domain.verifyingContract, tokenAbi, provider)

    let nonce = await tokenContract.nonces(myAddr)

    message = { ...message, nonce: nonce.toString() }
  }

  let typedData = {
    types: {
      EIP712Domain: domainSchema,
      Permit: permitSchema,
    },
    primaryType: 'Permit',
    domain,
    message,
  }

  let sig = await provider.send('eth_signTypedData_v3', [
    myAddr,
    JSON.stringify(typedData),
  ])

  return sig
}

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
    chainId: config.chainID,
    verifyingContract: '0x4dcC2886A94566B2688931Ad939fBA6c20B47e87',
  }

  const message = {
    holder: holderAddress,
    spender: spenderAddress,
    nonce,
    expiry: 0,
    allowed: true,
  }

  const sig = await signPermit(ethereum, domain, message)
  const splitSig = ethers.utils.splitSignature(sig)
  return splitSig
}
