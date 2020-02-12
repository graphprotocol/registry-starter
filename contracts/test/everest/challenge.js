/* Tests all challenge functionality, which is:
- funcs
    - What should it do
        - Only members can challenge
        - Members and Delegates can vote
        - Votes and vote weight work properly
        - Anyone can resolve a challenge
        - Challenges properly pass
        - Challenges properly fail
    - challenge()
    - submitVote()
    - submitVotes()
    - resolveChallenge()
- getters
    - hasVotingPeriodExpired()
    - memberChallengeExists()
    - challengeCanBeResolved()
    - just make sure they work

*/

const TokenRegistry = artifacts.require('TokenRegistry.sol')
const config = require('../../conf/config.js')
const paramConfig = config.tokenRegistryParams
const helpers = require('../helpers.js')
const utils = require('../utils.js')
// const BN = require('bn.js')

contract('tokenRegistry', () => {
    const member1Wallet = utils.ethersWallet(utils.walletPaths.nine) // throw away wallet
    const member1Address = member1Wallet.signingKey.address
    const owner1Wallet = utils.ethersWallet(utils.walletPaths.zero)
    const owner1Address = owner1Wallet.signingKey.address

    const member2Wallet = utils.ethersWallet(utils.walletPaths.eight) // throw away wallet
    const member2Address = member2Wallet.signingKey.address
    const owner2Wallet = utils.ethersWallet(utils.walletPaths.one)
    const owner2Address = owner2Wallet.signingKey.address

    const member3Wallet = utils.ethersWallet(utils.walletPaths.seven) // throw away wallet
    const member3Address = member3Wallet.signingKey.address
    const owner3Wallet = utils.ethersWallet(utils.walletPaths.two)
    const owner3Address = owner3Wallet.signingKey.address

    const member4Wallet = utils.ethersWallet(utils.walletPaths.six) // throw away wallet
    const member4Address = member4Wallet.signingKey.address
    const owner4Wallet = utils.ethersWallet(utils.walletPaths.three)
    const owner4Address = owner4Wallet.signingKey.address

    const voteChoice = {
        Null: 0,
        Yes: 1,
        No: 2
    }
    const fakeDetails = '0x5555555555555555555555555555555555555555555555555555555555554444'

    describe(
        'Challenges. Functions: challenge(), submitVote(), submitVotes() resolveChallenge(), ' +
            'memberChallengeExists(), challengeCanBeResolved(), isMember()',
        () => {
            it('should allow a member to be challenged, lose, and be removed', async () => {
                const tokenRegistry = await TokenRegistry.deployed()
                // Set up 4 Tokens. One to be challenged, three to vote
                await helpers.applySignedWithAttribute(member1Wallet, owner1Wallet)
                await helpers.applySignedWithAttribute(member2Wallet, owner2Wallet)
                await helpers.applySignedWithAttribute(member3Wallet, owner3Wallet)
                await helpers.applySignedWithAttribute(member4Wallet, owner4Wallet)

                // Check member exists
                assert(await tokenRegistry.isMember(member4Address), 'Member was not added')

                const tx = await tokenRegistry.challenge(
                    member1Address,
                    member4Address,
                    fakeDetails,
                    { from: owner1Address }
                )

                const challengeID = tx.logs[0].args.challengeID.toString()
                assert(
                    await tokenRegistry.memberChallengeExists(member4Address),
                    'Challenge was not created'
                )

                await tokenRegistry.submitVote(challengeID, voteChoice.Yes, member2Address, {
                    from: owner2Address
                })
                await tokenRegistry.submitVote(challengeID, voteChoice.Yes, member3Address, {
                    from: owner3Address
                })

                // Expect that challengee can't vote on their own challenge
                await utils.expectRevert(
                    tokenRegistry.submitVote(challengeID, voteChoice.Yes, member4Address, {
                        from: owner4Address
                    }),
                    `submitVote - Member can't vote on their own challenge`
                )

                // Increase time so challenge can be resolved
                await utils.increaseTime(utils.votePeriod + 1)
                assert(
                    await tokenRegistry.challengeCanBeResolved(challengeID),
                    'Challenge could not be resolved'
                )
                await tokenRegistry.resolveChallenge(challengeID, { from: owner1Address })

                // Check member has been removed
                assert(!(await tokenRegistry.isMember(member4Address)), 'Member was not removed')
            })

            // it('should allow a member to be challenged, win, and stay', async () => {})

            // it('challenge should fail when no one votes except the challenger', async () => {})
        }
    )
})
