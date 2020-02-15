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

    describe('Small test', () => {
        it('should allow a small test', async () => {
            // Get previous member start time
            const tokenRegistry = await TokenRegistry.deployed()
            const membershipStartTime = Number(
                (await tokenRegistry.getMembershipStartTime(ownerAddress1)).toString()
            )
            assert(membershipStartTime == 0, 'Membership start time should be 0')

            let logs = await tokenRegistry.applySignedOnly(ownerAddress1)//, { from: ownerAddress1 })
            console.log(logs)
            const membershipStartTimeUpdated = Number(
                (await tokenRegistry.getMembershipStartTime(ownerAddress1)).toString()
            )
            assert(membershipStartTimeUpdated != 0, 'Shouldnt be zero')
        })
    })
})