

const TokenRegistry = artifacts.require('TokenRegistry.sol')
const helpers = require('../helpers.js')
const utils = require('../utils.js')

contract('tokenRegistry', () => {
    const member1Wallet = utils.wallets.nine() // throw away wallet
    const member1Address = member1Wallet.signingKey.address
    const owner1Wallet = utils.wallets.zero()
    const owner1Address = owner1Wallet.signingKey.address

    const member2Wallet = utils.wallets.eight() // throw away wallet
    const member2Address = member2Wallet.signingKey.address
    const owner2Wallet = utils.wallets.one()
    const owner2Address = owner2Wallet.signingKey.address

    const member3Wallet = utils.wallets.seven() // throw away wallet
    const member3Address = member3Wallet.signingKey.address
    const owner3Wallet = utils.wallets.two()
    const owner3Address = owner3Wallet.signingKey.address

    const member4Wallet = utils.wallets.six() // throw away wallet
    const member4Address = member4Wallet.signingKey.address
    const owner4Wallet = utils.wallets.three()
    const owner4Address = owner4Wallet.signingKey.address

    const member5Wallet = utils.wallets.five() // throw away wallet
    const member5Address = member5Wallet.signingKey.address
    const owner5Wallet = utils.wallets.four()
    const owner5Address = owner5Wallet.signingKey.address

    const nonMemberWallet = utils.wallets.ten()
    const nonMemberAddress = nonMemberWallet.signingKey.address

    const voteChoice = {
        Null: 0,
        Yes: 1,
        No: 2
    }
    const fakeDetails = '0x5555555555555555555555555555555555555555555555555555555555554444'

    describe(
        'Test voting require statements and functionality',
        () => {
            // Set up 5 Tokens
            before(async () => {
                await helpers.applySignedWithAttribute(member1Wallet, owner1Wallet)
                await helpers.applySignedWithAttribute(member2Wallet, owner2Wallet)
                await helpers.applySignedWithAttribute(member3Wallet, owner3Wallet)
                await helpers.applySignedWithAttribute(member4Wallet, owner4Wallet)
                await helpers.applySignedWithAttribute(member5Wallet, owner5Wallet)
            })

            it('Voting on an expired challenge fails', async () => {
                // TODO
            })
            it('Voting must be yes or no, any other choice fails', async () => {
                // TODO
            })
            it('Voting on a challenge that does not exit fails', async () => {
                // TODO
            })
            it('Double voting on a challenge fails', async () => {
                // TODO
            })
            it('Voting by a non-member fails', async () => {
                // TODO
            })
            it('Voting on an expired challenge fails', async () => {
                // TODO
            })
        }
    )
})


/* TODOS
votings
- cant vote on an expired challenge
- must vote yes or no
- cant vote on a non existant challenge
- cant double vote
- cant vote own challenge DONE
- non members cant vote
- submitVotes
    - just test the function that you can vote for multiple
    - test arrays must be equal length
*/