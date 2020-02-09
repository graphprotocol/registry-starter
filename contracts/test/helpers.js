// Node modules
const keccak256 = require('js-sha3').keccak_256
const ethutil = require('ethereumjs-util')

// Local imports
const utils = require('./utils.js')
const TokenRegistry = artifacts.require('TokenRegistry.sol')
const EthereumDIDRegistry = artifacts.require('EthereumDIDRegistry.sol')
const Token = artifacts.require('dai.sol')

////////////// CONSTANTS //////////////
const offChainDataName = 'TokenData'
// Setting validity to max uint256 value, since we don't plan to use validity
const maxValidity = 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
// DAI_PERMIT_TYPEHASH = keccak256("Permit(address holder,address spender,uint256 nonce,uint256 expiry,bool allowed)");
const DAI_PERMIT_TYPEHASH = 'ea2aa0a1be11a07ed86d755c93467f4f82362b452371d1ba94d1715123511acb'

const helpers = {
    applySignedWithAttribute: async (newMemberWallet, ownerWallet) => {
        const ownerAddress = ownerWallet.signingKey.address
        const memberAddress = newMemberWallet.signingKey.address
        const tokenRegistry = await TokenRegistry.deployed()

        // Get the signature for changing ownership on ERC-1056 Registry
        const applySignedSig = await module.exports.applySigned(newMemberWallet, ownerWallet)
        // Get the signature for permitting TokenRegistry to transfer DAI on users behalf
        const permitSig = await module.exports.daiPermit(ownerWallet, tokenRegistry.address)

        const setAttributeData =
            Buffer.from('setAttribute').toString('hex') +
            utils.stringToBytes32(offChainDataName) +
            utils.stripHexPrefix(utils.mockIPFSData) +
            maxValidity
        // Get the signature for setting the attribute (i.e. Token data) on ERC-1056
        const setAttributeSignedSig = await module.exports.setAttributeSigned(
            newMemberWallet,
            ownerWallet,
            setAttributeData
        )

        // Send all three meta transactions to TokenRegistry to be executed in one tx
        tx = await tokenRegistry.applySignedWithAttribute(
            memberAddress,
            [applySignedSig.v, permitSig.v],
            [applySignedSig.r, permitSig.r],
            [applySignedSig.s, permitSig.s],
            ownerAddress,
            setAttributeSignedSig.v,
            setAttributeSignedSig.r,
            setAttributeSignedSig.s,
            '0x' + utils.stringToBytes32(offChainDataName),
            utils.mockIPFSData,
            '0x' + maxValidity
        )

        console.log(tx.receipt.rawLogs)

        // TODO - checks
                // const updatedAllowance = await token.allowance(holderAddress, spenderAddress)
        // assert.equal(
        //     updatedAllowance.toString(),
        //     '115792089237316195423570985008687907853269984665640564039457584007913129639935',
        //     'Allowance was not set to max'
        // )
    },

    applySigned: async (newMemberWallet, ownerWallet) => {
        const memberAddress = newMemberWallet.signingKey.address
        const memberPrivateKey = Buffer.from(
            utils.stripHexPrefix(newMemberWallet.signingKey.privateKey),
            'hex'
        )
        const ownerAddress = ownerWallet.signingKey.address
        const sig = await module.exports.signDataDIDRegistry(
            memberAddress,
            memberPrivateKey,
            Buffer.from('changeOwner').toString('hex') + utils.stripHexPrefix(ownerAddress),
            'changeOwner'
        )
        return sig
    },

    // Used after the owner is in possession of the identity
    setAttribute: async (memberAddress, ownerWallet) => {
        const didReg = await EthereumDIDRegistry.deployed()
        const ownerAddress = ownerWallet.signingKey.address
        const tx = await didReg.setAttribute(
            memberAddress,
            '0x' + utils.stringToBytes32(offChainDataName),
            utils.mockIPFSData,
            offChainDataValidity,
            { from: ownerAddress }
        )
        const event = tx.logs[0]
        assert.equal(event.event, 'DIDAttributeChanged')
        assert.equal(event.args.identity, memberAddress)
        assert.equal(event.args.name, '0x' + utils.stringToBytes32(offChainDataName))
        assert.equal(event.args.value, utils.mockIPFSData)
    },

    // Must be used in applySignedWithAttribute() to make a single transaction
    // Note owner is signer, because ownership has already been changed over
    setAttributeSigned: async (newMemberWallet, ownerWallet, data) => {
        const memberAddress = newMemberWallet.signingKey.address
        const ownerPrivateKey = Buffer.from(
            utils.stripHexPrefix(ownerWallet.signingKey.privateKey),
            'hex'
        )
        const sig = await module.exports.signDataDIDRegistry(
            memberAddress,
            ownerPrivateKey,
            data,
            'setAttribute'
        )
        return sig
    },

    signDataDIDRegistry: async (identity, signingKey, data, functionName) => {
        const didReg = await EthereumDIDRegistry.deployed()
        const nonce = await didReg.nonce(identity)
        const paddedNonce = utils.leftPad(Buffer.from([nonce], 64).toString('hex'))
        let dataToSign

        if (functionName == 'changeOwner') {
            dataToSign =
                '1900' +
                utils.stripHexPrefix(didReg.address) +
                paddedNonce +
                utils.stripHexPrefix(identity) +
                data
        } else if (functionName == 'setAttribute') {
            dataToSign =
                '1900' +
                utils.stripHexPrefix(didReg.address) +
                paddedNonce +
                utils.stripHexPrefix(identity) +
                data
        }
        const hash = Buffer.from(keccak256.buffer(Buffer.from(dataToSign, 'hex')))
        const signature = ethutil.ecsign(hash, signingKey)

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

        // ChainID of uint256 9854 used for development, in bytes32
        const paddedChainID = '000000000000000000000000000000000000000000000000000000000000267e'
        const daiAddress = (await Token.deployed()).address
        console.log("DAI ADDR: ", daiAddress)
        const paddedDaiAddress = utils.leftPad(utils.stripHexPrefix(daiAddress))
        const data = domain + hashedName + hashedVersion + paddedChainID + paddedDaiAddress
        const hash = Buffer.from(keccak256.buffer(Buffer.from(data, 'hex')))
        return hash
    },

    signPermit: async (holderAddress, spenderAddress, holderPrivateKey, nonce) => {
        const paddedNonce = utils.leftPad(Buffer.from([nonce], 64).toString('hex'))
        console.log("PADDED NONCE: ", paddedNonce)
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
            000000000000000000000000ffcf8fdee72ac11b5c542428b35eef5769c409f
            000000000000000000000000290fb167208af455bb137780163b7b7a9a10c16
            0000000000000000000000000000000000000000000000000000000000000000
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
            01b930e8948f5be49f019425c83bcf1657b07efb06fb959192051e9c412abace
        */
       console.log("STRUCT ENCODED: ", structEncoded)
        const hashedStruct = Buffer.from(keccak256.buffer(Buffer.from(structEncoded, 'hex')))
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
        const digest = Buffer.from(keccak256.buffer(Buffer.from(digestData, 'hex')))
        console.log("DIGESt: ", digest.toString('hex'))

        const signature = ethutil.ecsign(digest, holderPrivateKey)
        return {
            r: '0x' + signature.r.toString('hex'),
            s: '0x' + signature.s.toString('hex'),
            v: signature.v
        }
    },

    // Where holder == owner and spender == TokenRegistry
    daiPermit: async (holderWallet, spenderAddress) => {
        const token = await Token.deployed()
        const holderAddress = holderWallet.signingKey.address
        const nonce = (await token.nonces(holderAddress)).toString()
        const holderPrivateKey = Buffer.from(
            utils.stripHexPrefix(holderWallet.signingKey.privateKey),
            'hex'
        )
        const sig = await module.exports.signPermit(
            holderAddress,
            spenderAddress,
            holderPrivateKey,
            nonce
        )
        return sig
    }
}

module.exports = helpers
