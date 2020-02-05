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

const tokenRegistry = artifacts.require('tokenRegistry.sol')
const fs = require('fs')
const config = require('../../conf/config.js')
const paramConfig = config.tokenRegistryParams
const utils = require('../utils.js')
const ethers = require('ethers')
// const BN = require('bn.js') can get from utils

contract('tokenRegistry', accounts => {
    let [tokenRegistryOwner, firstOwner] = accounts
    const memberName = 'The Graph'
    // firstOwner = "0x93606b27cB5e4c780883eC4F6b7Bed5f6572d1dd"
    describe('Member joining and leaving. Functions: applyMember(), whitelist(), memberExit(), isWhiteListed()', () => {
        it('should allow a member to apply, pass time, and get whitelisted', async () => {
            // let applicantWallet = utils.ethersWallet(utils.walletPaths.zero)

            const newMember = utils.ethersWallet(utils.walletPaths.zero)
            const newMemberAddress = newMember.signingKey.address
            const owner = utils.ethersWallet(utils.walletPaths.one)

            // await utils.applySignedWithAttribute(applicant, delegate, applicantWallet)
            await utils.applySigned(newMember, owner)

            await utils.setAttribute(newMemberAddress, owner)
            await utils.daiPermit(newMember, owner)
            // let tokenRegistry = await tokenRegistry.deployed()
            // console.log(await tokenRegistry.isMember(newMember))
            // console.log(await tokenRegistry.memberChallengeExists(owner))
        })

        it('should allow a member to exit', async () => {
            // const tokenRegistry = await tokenRegistry.deployed()
            // await tokenRegistry.memberExit(memberName, { from: applicant })
            // const isWhitelisted = await tokenRegistry.isWhitelisted(memberName)
            // assert(!isWhitelisted, 'Project was removed from whitelist')
        })
    })
    describe('Member editing. Functions: editMemberOwner(), editOffchainData(), editDelegate()', () => {
        it('should allow only owner (not delegate) to editMemberOwner()', async () => {})

        it('should allow owner and delegate to call editOffChainData()', async () => {})

        it('should allow owner and delegate to call editDelegate()', async () => {})

        it('should allow only owner (not delegate) to edit owner', async () => {})
    })
})
