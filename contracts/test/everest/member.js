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
            // Do the normal way of signing up through helpers.applySignedWithAttribute
            // await helpers.applySignedWithAttribute(newMemberWallet, ownerWallet1)

            // TODO - why doesn't this work, try out other reverts
            // Build the TX again to pass into expectRevert
            // const ownerAddress = ownerWallet.signingKey.address
            // const newMemberAddress = newMemberWallet.signingKey.address
            // const tokenRegistry = await TokenRegistry.deployed()
            // const token = await Token.deployed()
    
            // // Get the signature for changing ownership on ERC-1056 Registry
            // const applySignedSig = await module.exports.applySigned(newMemberWallet, ownerWallet)
            // // Get the signature for permitting TokenRegistry to transfer DAI on users behalf
            // const permitSig = await module.exports.daiPermit(ownerWallet, tokenRegistry.address)
    
            // const setAttributeData =
            //     Buffer.from('setAttribute').toString('hex') +
            //     utils.stringToBytes32(offChainDataName) +
            //     utils.stripHexPrefix(utils.mockIPFSData) +
            //     maxValidity
            // // Get the signature for setting the attribute (i.e. Token data) on ERC-1056
            // const setAttributeSignedSig = await module.exports.setAttributeSigned(
            //     newMemberWallet,
            //     ownerWallet,
            //     setAttributeData
            // )

            // await utils.expectRevert(
            //     tokenRegistry.applySignedWithAttribute(
            //         newMemberAddress,
            //         [applySignedSig.v, permitSig.v],
            //         [applySignedSig.r, permitSig.r],
            //         [applySignedSig.s, permitSig.s],
            //         ownerAddress,
            //         setAttributeSignedSig.v,
            //         setAttributeSignedSig.r,
            //         setAttributeSignedSig.s,
            //         '0x' + utils.stringToBytes32(offChainDataName),
            //         utils.mockIPFSData,
            //         '0x' + maxValidity,
            //         { from: ownerAddress }
            //     ),
            //     'applySignedInternal - This member already exists'
            // )
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
