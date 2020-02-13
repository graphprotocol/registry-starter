const TokenRegistry = artifacts.require('TokenRegistry.sol')
const Token = artifacts.require('dai.sol')
const helpers = require('../helpers.js')
const utils = require('../utils.js')

contract('TokenRegistry', accounts => {
    const newMemberWallet = utils.wallets.nine() // throw away wallet
    const ownerWallet = utils.wallets.one()
    const registryOwnerWallet = utils.wallets.zero()
    const registryOwnerAddress = registryOwnerWallet.signingKey.address

    describe('TokenRegistry owner functionality. Functions: withdraw(), updateCharter()', () => {
        it('should allow owner to update the charter', async () => {
            const tokenRegistry = await TokenRegistry.deployed()
            const newCharter = '0x0123456789012345678901234567890123456789012345678901234567891111'
            await tokenRegistry.updateCharter(newCharter, { from: registryOwnerAddress })
            const updatedCharter = await tokenRegistry.charter()
            assert.equal(updatedCharter, newCharter, 'Charter was not updated')
        })

        it('should allow owner to withdraw DAI from reserve bank', async () => {
            // Apply one member so the reserve bank has 10 DAI
            await helpers.applySignedWithAttribute(newMemberWallet, ownerWallet)

            const tokenRegistry = await TokenRegistry.deployed()
            const token = await Token.deployed()
            const reserveBankAddress = await tokenRegistry.reserveBank()

            const bankOwnerBalanceStart = await token.balanceOf(registryOwnerAddress)
            const reserveBankBalanceStart = await token.balanceOf(reserveBankAddress)

            await tokenRegistry.withdraw(registryOwnerAddress, utils.applyFeeBN, {
                from: registryOwnerAddress
            })

            const bankOwnerBalanceEnd = await token.balanceOf(registryOwnerAddress)
            const reserveBankBalanceEnd = await token.balanceOf(reserveBankAddress)

            assert.equal(
                bankOwnerBalanceEnd.toString(),
                bankOwnerBalanceStart.add(utils.applyFeeBN).toString(),
                'Owner did not withdraw application fee'
            )
            assert.equal(
                reserveBankBalanceEnd.toString(),
                reserveBankBalanceStart.sub(utils.applyFeeBN).toString(),
                'Reserve bank did not withdraw funds'
            )
        })
    })
})
