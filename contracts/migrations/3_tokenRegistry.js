const TokenRegistry = artifacts.require('TokenRegistry.sol')
const Token = artifacts.require('dai.sol')
const EthereumDIDRegistry = artifacts.require('EthereumDIDRegistry.sol')
const config = require('../conf/config.js')

module.exports = async (deployer, network, accounts) => {
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

    let daiAddress = (await Token.deployed()).address
    const params = config.tokenRegistryParams
    
    // On first deploy, reserve bank is address 0xf68f5498dd766a8d65c4785219d61fcc5e0e920a
    await deployer.deploy(
        TokenRegistry,
        daiAddress,
        params.votingPeriodDuration,
        params.challengeDeposit,
        params.applicationFee,
        params.charter,
        didAddress, {from: owner}
    )
}
