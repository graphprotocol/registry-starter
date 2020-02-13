const TokenRegistry = artifacts.require('TokenRegistry.sol')
const helpers = require('../helpers.js')
const utils = require('../utils.js')

contract('TokenRegistry', () => {
    const newMemberWallet = utils.wallets.nine() // throw away wallet
    const newMemberAddress = newMemberWallet.signingKey.address
    const ownerWallet1 = utils.wallets.one()
    const ownerAddress1 = ownerWallet1.signingKey.address
    const ownerWallet2 = utils.wallets.two()
    const ownerAddress2 = ownerWallet2.signingKey.address

    describe('Member joining and leaving. Functions: applySignedWithAttribute(), memberExit()', () => {
        // Allows a member to permit the TokenRegistry to transfer DAI, apply to be on the
        // TokenRegistry, and update the token information, while using ERC-1056 for each
        it('Should allow member to join the registry', async () => {
            await helpers.applySignedWithAttribute(newMemberWallet, ownerWallet1)
        })

        it('Should prevent a member from double joining', async () => {
            // Should fail when trying to apply again
            await utils.expectRevert(
                helpers.applySignedWithAttribute(newMemberWallet, ownerWallet1),
                'applySignedInternal - This member already exists'
            )
        })

        it('should allow a member to exit', async () => {
            // Get previous member start time
            const tokenRegistry = await TokenRegistry.deployed()
            const membershipStartTime = Number(
                (await tokenRegistry.getMembershipStartTime(newMemberAddress)).toString()
            )
            assert(membershipStartTime > 0, 'Membership start time not updated')

            // Get updated member start time (should be 0)
            await tokenRegistry.memberExit(newMemberAddress, { from: ownerAddress1 })
            const membershipStartTimeUpdated = Number(
                (await tokenRegistry.getMembershipStartTime(newMemberAddress)).toString()
            )
            assert(membershipStartTimeUpdated == 0, 'Membership start time should be reset to 0')
        })
    })
    describe('Member editing. Functions: setAttribute()', () => {
        it('should allow an updated owner to set attribute', async () => {
            await helpers.setAttribute(newMemberAddress, ownerWallet1)
        })
    })
})

// TODO - no double join
