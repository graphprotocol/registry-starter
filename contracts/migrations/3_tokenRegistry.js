/* global artifacts */

const TokenRegistry = artifacts.require('TokenRegistry.sol')
const Token = artifacts.require('./lib/Dai.sol')
const EthereumDIDRegistry = artifacts.require('EthereumDIDRegistry.sol')
const config = require('../conf/config.js')
// const fs = require('fs')
// const Registry = artifacts.require('Registry.sol')
// const ReserveBank = artifacts.require('ReserveBank.sol')

module.exports = async (deployer, network, accounts) => {
    // Approve all token holders to allow tokenRegistry to spend on their behalf
    async function approveTokenRegistryFor(addresses) {
        const token = await Token.deployed()
        const tokenRegistry = await TokenRegistry.deployed()
        const user = addresses[0]
        const balanceOfUser = await token.balanceOf(user)
        await token.approve(tokenRegistry.address, balanceOfUser, { from: user })
        if (addresses.length === 1) {
            return true
        }
        return approveTokenRegistryFor(addresses.slice(1))
    }

    let owner
    let didAddress
    if (network === 'development') {
        owner = config.tokenRegistryParams.owner
        // We must deploy our own DID registry for ganache
        await deployer.deploy(EthereumDIDRegistry)
        const edr = await EthereumDIDRegistry.deployed()
        didAddress = edr.address
    } else if (network === 'ropsten') {
        owner = config.tokenRegistryParams.ropstenOwner
        didAddress = config.ethereumDIDRegistryAddress
    }

    const params = config.tokenRegistryParams
    await deployer.deploy(
        TokenRegistry,
        owner,
        params.approvedToken,
        params.votingPeriodDuration,
        params.challengeDeposit,
        params.applicationFee,
        params.charter,
        didAddress
    )

    // Not necessary for mainnet, since it will not be using the mock token
    if (network !== 'mainnet') {
        await approveTokenRegistryFor(accounts)
    }
}
