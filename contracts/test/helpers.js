const ethers = require('ethers')
const fs = require('fs')
const { time, expectEvent, expectRevert, constants } = require('openzeppelin-test-helpers')
var keccak256 = require('js-sha3').keccak_256
var ethutil = require('ethereumjs-util')
var BN = require('bn.js')

const utils = require('./utils.js')


// const BN = require('bn.js') TODO - remove this and from package.json. We use BN from test helpers

// const url = 'http://localhost:8545';
// const provider = new ethers.providers.JsonRpcProvider(url);
// Getting the accounts
// const signer0 = provider.getSigner(0);
// const signer1 = provider.getSigner(1);
// const hello = JSON.parse(fs.readFileSync('./hello.txt'))
// console.log(__dirname)
// console.log(__filename)
const config = require('../conf/config.js')
const paramConfig = config.tokenRegistryParams

const Registry = artifacts.require('Registry.sol')
const TokenRegistry = artifacts.require('TokenRegistry.sol')
const EthereumDIDRegistry = artifacts.require('EthereumDIDRegistry.sol')
const Token = artifacts.require('dai.sol')

// offChainDataName = bytes32('ProjectData')
const offChainDataName = '0x50726f6a65637444617461000000000000000000000000000000000000000000'
// 100 years, an artbitrary value we pass since we don't use validity in V1
const offChainDataValidity = 3153600000

const arbitraryIPFSBytes = '0x4444444444444444444444444440000000000000000000000000000000000000'
const randomBytes32 = ethers.utils.randomBytes(32)

const privateKey = Buffer.from(
    'a285ab66393c5fdda46d6fbad9e27fafd438254ab72ad5acb681a0e9f20f5d7b',
    'hex'
)
const signerAddress = '0x2036C6CD85692F0Fb2C26E6c6B2ECed9e4478Dfd'

const privateKey2 = Buffer.from(
    'a285ab66393c5fdda46d6fbad9e27fafd438254ab72ad5acb681a0e9f20f5d7a',
    'hex'
)
const signerAddress2 = '0xEA91e58E9Fa466786726F0a947e8583c7c5B3185'


// DAI_PERMIT_TYPEHASH = keccak256("Permit(address holder,address spender,uint256 nonce,uint256 expiry,bool allowed)");
const DAI_PERMIT_TYPEHASH = 'ea2aa0a1be11a07ed86d755c93467f4f82362b452371d1ba94d1715123511acb'


const helpers = {
    applySignedWithAttribute: async (newMember, owner, wallet) => {},

    // signTransaction: async (data, wallet) => {
    //     const hash = ethers.utils.keccak256(data)
    //     const hashArray = ethers.utils.arrayify(hash)
    //     let signedMessage = await wallet.signMessage(hashArray) // AUTO PREFIX Ethereum signed msg 19
    //     sig = ethers.utils.splitSignature(signedMessage)
    //     return sig
    // },

    getIdentityNonce: async identity => {
        const etherDIDRegistry = await EthereumDIDRegistry.deployed()
        return etherDIDRegistry.nonce(identity)
    },

    applySigned: async (memberWallet, ownerWallet) => {
        const didReg = await EthereumDIDRegistry.deployed()
        const tokenRegistry = await TokenRegistry.deployed()
        const memberAddress = memberWallet.signingKey.address
        const memberPrivateKey = Buffer.from(
            utils.stripHexPrefix(memberWallet.signingKey.privateKey),
            'hex'
        )
        const ownerAddress = ownerWallet.signingKey.address
        const sig = await module.exports.signDataDIDRegistry(
            memberAddress,
            memberAddress,
            memberPrivateKey,
            Buffer.from('changeOwner').toString('hex') + utils.stripHexPrefix(ownerAddress)
        )
        tx = await didReg.changeOwnerSigned(memberAddress, sig.v, sig.r, sig.s, ownerAddress, {
            from: ownerAddress
        })
        const updatedOwner = await didReg.owners(memberAddress)
        assert.equal(updatedOwner, ownerAddress)
    },

    setAttribute: async (memberAddress, ownerWallet) => {
        const didReg = await EthereumDIDRegistry.deployed()
        const ownerAddress = ownerWallet.signingKey.address
        const tx = await didReg.setAttribute(
            memberAddress,
            offChainDataName,
            arbitraryIPFSBytes,
            offChainDataValidity,
            { from: ownerAddress }
        )
        const event = tx.logs[0]
        assert.equal(event.event, 'DIDAttributeChanged')
        assert.equal(event.args.identity, memberAddress)
        assert.equal(event.args.name, offChainDataName)
        assert.equal(event.args.value, arbitraryIPFSBytes)
    },

    signDataDIDRegistry: async (identity, signer, key, data) => {
        const didReg = await EthereumDIDRegistry.deployed()
        const nonce = await didReg.nonce(signer)
        const paddedNonce = utils.leftPad(Buffer.from([nonce], 64).toString('hex'))
        const dataToSign =
            '1900' +
            utils.stripHexPrefix(didReg.address) +
            paddedNonce +
            utils.stripHexPrefix(identity) +
            data
        const hash = Buffer.from(keccak256.buffer(Buffer.from(dataToSign, 'hex')))
        const signature = ethutil.ecsign(hash, key)
        // const publicKey = ethutil.ecrecover(hash, signature.v, signature.r, signature.s)
        return {
            r: '0x' + signature.r.toString('hex'),
            s: '0x' + signature.s.toString('hex'),
            v: signature.v
        }
    },

    createDaiDomainSeparator: async () => {
        const domain = keccak256(
            'EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)'
        )
        const daiName = 'Dai Stablecoin'
        const daiVersion = '1'
        const hashedName = keccak256(daiName)
        const hashedVersion = keccak256(daiVersion)

        // ChainID of uint256 9854 used for development
        const paddedChainID = '000000000000000000000000000000000000000000000000000000000000267e'
        const daiAddress = (await Token.deployed()).address
        const paddedDaiAddress = utils.leftPad(utils.stripHexPrefix(daiAddress))
        const data = domain + hashedName + hashedVersion + paddedChainID + paddedDaiAddress
        const hash = Buffer.from(keccak256.buffer(Buffer.from(data, 'hex')))
        return hash
    },

    signDataPermit: async (holderAddress, spenderAddress, holderPrivateKey, nonce) => {
        const paddedNonce = utils.leftPad(Buffer.from([nonce], 64).toString('hex'))
        // We set expiry to 0 always, as that will be default for the TokenRegistry calling
        const paddedExpiry = utils.leftPad(Buffer.from([0], 64).toString('hex'))
        // We set to 1 == true, as that will be default for the TokenRegistry calling
        const paddedTrue = utils.leftPad(Buffer.from([1], 64).toString('hex'))

        /*  Expected DAI_DOMAIN_SEPARATOR value on first test deploy (dependant on mock dai addr):
            Where mock dai addr = 0xCfEB869F69431e42cdB54A4F4f105C19C080A601 :
            0xcf69a4130104a154c155546e3966369c03a442bdff846f0bc1aae6f9e9a3b68f
        */
        const DAI_DOMAIN_SEPARATOR = await module.exports.createDaiDomainSeparator()

        /*  Expected structEncoded value on first test run (dependant on mock dai address)
            Where mock dai addr = 0xCfEB869F69431e42cdB54A4F4f105C19C080A601
            (note all are concatenated, spaces are for readability)
            Note we do not have 0x at the front of the byte string: 

            ea2aa0a1be11a07ed86d755c93467f4f82362b452371d1ba94d1715123511acb
            00000000000000000000000090f8bf6a479f320ead074411a4b0e7944ea8c9c1
            000000000000000000000000ffcf8fdee72ac11b5c542428b35eef5769c409f0
            0000000000000000000000000000000000000000000000000000000000000001
            0000000000000000000000000000000000000000000000000000000000000000
            0000000000000000000000000000000000000000000000000000000000000001
        */
        const structEncoded =
            DAI_PERMIT_TYPEHASH +
            // abi.encode in solidity automatically removes the checksum, so we must use toLowerCase
            utils.leftPad(utils.stripHexPrefix(holderAddress.toLowerCase())) +
            utils.leftPad(utils.stripHexPrefix(spenderAddress.toLowerCase())) +
            paddedNonce +
            paddedExpiry +
            paddedTrue

        /*  Expected hashedStruct value:
            0x160e72b94c8cf3bd74587430d9c4971ce4d7ab51f3e442c09aa6fa7f68522599
        */
        const hashedStruct = Buffer.from(keccak256.buffer(Buffer.from(structEncoded, 'hex')))
        const stringHashedStruct = hashedStruct.toString('hex')
        const stringDomainSeparator = DAI_DOMAIN_SEPARATOR.toString('hex')

        console.log("DAI DOMAIN: ", stringDomainSeparator)

        /*  Expected digestData value on first test run (dependant on mock dai address)
            Where mock dai addr = 0xCfEB869F69431e42cdB54A4F4f105C19C080A601
            (note all are concatenated, spaces are for readability)
            Note we do not have 0x at the front of the byte string: 

            1901
            cf69a4130104a154c155546e3966369c03a442bdff846f0bc1aae6f9e9a3b68f
            160e72b94c8cf3bd74587430d9c4971ce4d7ab51f3e442c09aa6fa7f68522599
        */
        const digestData = '1901' + stringDomainSeparator + stringHashedStruct
        console.log("DIGEST DATA: ", digestData)

        // console.log('struct encoded: ', keccak256(structEncoded))
        /// TODO EXPECTED 0xdda83dcc6b81d13e5f84a41c2509a5f6fa5486698f378d54211aff1d4b70e492

        const digest = Buffer.from(keccak256.buffer(Buffer.from(digestData, 'hex')))
        console.log('HOPED: ', digest)
        const signature = ethutil.ecsign(digest, holderPrivateKey)
        const publicKey = ethutil.ecrecover(digest, signature.v, signature.r, signature.s)
        // console.log("PUBLIC KEY: ", publicKey)
        // console.log(signature)
        return {
            r: '0x' + signature.r.toString('hex'),
            s: '0x' + signature.s.toString('hex'),
            v: signature.v
        }
    },

    daiPermit: async (holderWallet, spenderWallet) => {
        const token = await Token.deployed()
        const holderAddress = holderWallet.signingKey.address
        const spenderAddress = spenderWallet.signingKey.address
        // Nonce acutally has to add 1, since it is the nonce of current tx
        const nonce = (await token.nonces(holderAddress)) + 1
        const tokenRegistry = await TokenRegistry.deployed()
        const holderPrivateKey = Buffer.from(
            utils.stripHexPrefix(holderWallet.signingKey.privateKey),
            'hex'
        )
        // const ownerAddress = spenderAddress.signingKey.address
        const sig = await module.exports.signDataPermit(
            holderAddress,
            spenderAddress,
            holderPrivateKey,
            nonce
        )
        tx = await token.permit(
            holderAddress,
            spenderAddress,
            nonce,
            0,
            true,
            sig.v,
            sig.r,
            sig.s,
            {
                from: spenderAddress
            }
        )
        const updatedAllowance = await token.allowance(holderAddress, spenderAddress)
        console.log('UA: ', updatedAllowance)
        // assert.equal(updatedOwner, spenderAddress)
    }
}

module.exports = helpers
