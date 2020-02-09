/* Tests all member functionality, which is:
- apply
    - applySignedInternal()
        - confirm it is an internal function
    - applySigned()
        - Confirm it works
        - Test applySignedInternal() here
    - applySignedWithDelegate()
        - just test it does what it is supposed to, because it is two wrapped funcs
    - applySignedWithAttribute()
        - just test it does what it is supposed to, because it is two wrapped funcs
    - applySignedWithAttributeAndDelegate()
        - just test it does what it is supposed to, because it is three wrapped funcs

    - What should it do?
        - Apply, wait, be implicitly approve
        - Apply, get challenged, lose voting ability, pass challenge, gain voting
        - Apply, get challenged, lose ability
        - Member exit in application or in 
        - notes
            - a member can challengee or vote, that is all to note for testing
- memberExit()
- edit member functions
    - changeOwnerSigned()
    - editOffChainDataSigned()
    - addDelegateSigned()
    - revokeDelegateSigned()
- getters
    - isMember()
    -   make sure it works
*/

const TokenRegistry = artifacts.require('TokenRegistry.sol')
const Token = artifacts.require('dai.sol')
const EthereumDIDRegistry = artifacts.require('EthereumDIDRegistry.sol')
const fs = require('fs')
const config = require('../../conf/config.js')
const paramConfig = config.tokenRegistryParams
const helpers = require('../helpers.js')
const utils = require('../utils.js')

const ethers = require('ethers')
// const BN = require('bn.js') can get from helpers

contract('TokenRegistry', accounts => {
    let [tokenRegistryOwner, firstOwner] = accounts
    describe('Member joining and leaving. Functions: applySignedWithAttribute(), memberExit()', () => {
        // Allows a member to permit the TokenRegistry to transfer DAI, apply to be on the
        // TokenRegistry, and update the token information, while using ERC-1056 for each
        it('Should allow member to join the registry', async () => {
            const newMemberWallet = utils.ethersWallet(utils.walletPaths.zero)
            const newMemberWalletAddress = newMemberWallet.signingKey.address
            const ownerWallet = utils.ethersWallet(utils.walletPaths.one)
            const ownerWalletAddress = ownerWallet.signingKey.address
            const didReg = await EthereumDIDRegistry.deployed()
            const daiToken = await Token.deployed()


            console.log("BALANCE: ", (await daiToken.balanceOf("0xf68f5498dd766a8d65c4785219d61fcc5e0e920a")).toString())
            console.log("BALANCE: ", (await daiToken.balanceOf(newMemberWalletAddress)).toString())
            console.log("BALANCE: ", (await daiToken.balanceOf(ownerWalletAddress)).toString())

            // TODO - don't use newMemberWallet, use a throw away wallet, to symbolize the real situation. 
            await helpers.applySignedWithAttribute(newMemberWallet, ownerWallet)
            // await helpers.tempEditOffChainData(newMemberWallet, ownerWallet)

            // TODO - pretty sure balance is wrong here, in the contract, it should be minusing
            console.log("BALANCE: ", (await daiToken.balanceOf("0xf68f5498dd766a8d65c4785219d61fcc5e0e920a")).toString())
            console.log("BALANCE: ", (await daiToken.balanceOf(newMemberWalletAddress)).toString())
            console.log("BALANCE: ", (await daiToken.balanceOf(ownerWalletAddress)).toString())

            // await helpers.setAttribute(newMemberWalletAddress, ownerWallet)
            // await helpers.daiPermit(newMemberWallet, ownerWallet)
        })

        // it('should allow a member to exit', async () => {
        //     // const tokenRegistry = await TokenRegistry.deployed()
        //     // await TokenRegistry.memberExit(memberName, { from: applicant })
        //     // const isWhitelisted = await TokenRegistry.isWhitelisted(memberName)
        //     // assert(!isWhitelisted, 'Project was removed from whitelist')
        // })
    })
    // describe('Member editing. Functions: editMemberOwner(), editOffchainData(), editDelegate()', () => {
    //     it('should allow only owner (not delegate) to editMemberOwner()', async () => {})

    //     it('should allow owner and delegate to call editOffChainData()', async () => {})

    //     it('should allow owner and delegate to call editDelegate()', async () => {})

    //     it('should allow only owner (not delegate) to edit owner', async () => {})
    // })
})
