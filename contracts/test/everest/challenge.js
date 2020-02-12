const TokenRegistry = artifacts.require('TokenRegistry.sol')
const helpers = require('../helpers.js')
const utils = require('../utils.js')
// const BN = require('bn.js')

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
            // Set up 5 Tokens
            before(async () => {
                await helpers.applySignedWithAttribute(member1Wallet, owner1Wallet)
                await helpers.applySignedWithAttribute(member2Wallet, owner2Wallet)
                await helpers.applySignedWithAttribute(member3Wallet, owner3Wallet)
                await helpers.applySignedWithAttribute(member4Wallet, owner4Wallet)
                await helpers.applySignedWithAttribute(member5Wallet, owner5Wallet)
            })

            it('should allow a member to be challenged, lose, and be removed, and then reapply successfully', async () => {
                const tokenRegistry = await TokenRegistry.deployed()

                // Check member exists
                assert(await tokenRegistry.isMember(member4Address), 'Member was not added')

                const tx = await tokenRegistry.challenge(
                    member1Address,
                    member5Address,
                    fakeDetails,
                    { from: owner1Address }
                )

                const challengeID = tx.logs[0].args.challengeID.toString()
                assert(
                    await tokenRegistry.memberChallengeExists(member5Address),
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
                    tokenRegistry.submitVote(challengeID, voteChoice.Yes, member5Address, {
                        from: owner5Address
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
                assert(!(await tokenRegistry.isMember(member5Address)), 'Member was not removed')

                // Reapply, get back on list
                // TODO - the problem here is, reapplying, we get in a weird state that doesnt work
                // because of the identity standard. 
                // await helpers.applySignedWithAttribute(owner5Wallet, owner5Wallet)
            })

            it('should allow a member to be challenged, win, and stay', async () => {
                const tokenRegistry = await TokenRegistry.deployed()
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

                await tokenRegistry.submitVote(challengeID, voteChoice.No, member2Address, {
                    from: owner2Address
                })
                await tokenRegistry.submitVote(challengeID, voteChoice.No, member3Address, {
                    from: owner3Address
                })

                // Increase time so challenge can be resolved
                await utils.increaseTime(utils.votePeriod + 1)
                await tokenRegistry.resolveChallenge(challengeID, { from: owner1Address })

                // Check member has been removed
                assert(
                    await tokenRegistry.isMember(member4Address),
                    'Member was removed, when they shouldnt have been'
                )
            })

            it('challenge should fail when no one votes except the challenger', async () => {})
            it('challengee cant have multiple challenges against them', async () => {})
            it('challenger cant challenge self', async () => {})
            it('challenger must exist', async () => {})
            it('challenger must exist', async () => {})
        }
    )
})

/* TODOS
votins
- cant vote on an expired challenge
- must vote yes or no
- cant vote on a non existant challenge
- cant double vote
- cant vote own challenge DONE
- non members cant vote

challenges
- non members cant 
- check token balances after challenges 

submitVotes
- vote for multiple 
- arrays must be equal lengths

tokenRegistry
- member cant exit during an ongoing challenge


*/
