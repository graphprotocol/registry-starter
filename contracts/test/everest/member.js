const TokenRegistry = artifacts.require('TokenRegistry.sol')
const helpers = require('../helpers.js')
const utils = require('../utils.js')

contract('TokenRegistry', () => {
    const newMemberWallet = utils.ethersWallet(utils.walletPaths.nine) // throw away wallet
    const newMemberAddress = newMemberWallet.signingKey.address
    const ownerWallet = utils.ethersWallet(utils.walletPaths.one)
    const ownerAddress = ownerWallet.signingKey.address
    
    describe('Member joining and leaving. Functions: applySignedWithAttribute(), memberExit()', () => {
        // Allows a member to permit the TokenRegistry to transfer DAI, apply to be on the
        // TokenRegistry, and update the token information, while using ERC-1056 for each
        it('Should allow member to join the registry', async () => {
            await helpers.applySignedWithAttribute(newMemberWallet, ownerWallet)
        })

        it('should allow a member to exit', async () => {
            // Get previous member start time
            const tokenRegistry = await TokenRegistry.deployed()
            const membershipStartTime = Number((await tokenRegistry.getMembershipStartTime(newMemberAddress)).toString())
            assert(membershipStartTime > 0, "Membership start time not updated")

            // Get updated member start time (should be 0)
            await tokenRegistry.memberExit(newMemberAddress, { from: ownerAddress })
            const membershipStartTimeUpdated = Number((await tokenRegistry.getMembershipStartTime(newMemberAddress)).toString())
            assert(membershipStartTimeUpdated == 0, "Membership start time should be reset to 0")
        })
    })
    describe('Member editing. Functions: setAttribute()', () => {
        it('should allow an updated owner to set attribute', async () => {
            await helpers.setAttribute(newMemberAddress, ownerWallet)
        })
    })
})
