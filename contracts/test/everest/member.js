const TokenRegistry = artifacts.require('TokenRegistry.sol')
const Token = artifacts.require('dai.sol')
const EthereumDIDRegistry = artifacts.require('EthereumDIDRegistry.sol')
const helpers = require('../helpers.js')
const utils = require('../utils.js')

// const config = require('../../conf/config.js')
// const paramConfig = config.tokenRegistryParams
// const ethers = require('ethers')
// const BN = require('bn.js') can get from helpers

contract('TokenRegistry', accounts => {
    let [tokenRegistryOwner, firstOwner] = accounts
    describe('Member joining and leaving. Functions: applySignedWithAttribute(), memberExit()', () => {
        // Allows a member to permit the TokenRegistry to transfer DAI, apply to be on the
        // TokenRegistry, and update the token information, while using ERC-1056 for each
        it('Should allow member to join the registry', async () => {
            const newMemberWallet = utils.ethersWallet(utils.walletPaths.nine) // throw away wallet
            const ownerWallet = utils.ethersWallet(utils.walletPaths.one)
            await helpers.applySignedWithAttribute(newMemberWallet, ownerWallet)
        })

        it('should allow a member to exit', async () => {
            // const tokenRegistry = await TokenRegistry.deployed()
            // await TokenRegistry.memberExit(memberName, { from: applicant })
            // const isWhitelisted = await TokenRegistry.isWhitelisted(memberName)
            // assert(!isWhitelisted, 'Project was removed from whitelist')
        })
    })
    // describe('Member editing. Functions: editMemberOwner(), editOffchainData(), editDelegate()', () => {
    //     it('should allow only owner (not delegate) to editMemberOwner()', async () => {})

    //     it('should allow owner and delegate to call editOffChainData()', async () => {})

    //     it('should allow owner and delegate to call editDelegate()', async () => {})

    //     it('should allow only owner (not delegate) to edit owner', async () => {})
    // })
})
