// import { BigInt, store, ipfs, json, Bytes } from '@graphprotocol/graph-ts'

// import {
//   NewMember,
//   MemberExited,
//   CharterUpdated,
//   Withdrawal,
//   TokenRegistryDeployed,
//   MemberChallenged,
//   SubmitVote,
//   ChallengeFailed,
//   ChallengeSucceeded,
// } from '../types/TokenRegistry/TokenRegistry'

// import { Token, TokenRegistry, Challenge, Vote } from '../types/schema'

// import { addQm } from './helpers'

// // This runs before any ethereumDIDRegistry events run, and once an applicaiton is made, the
// // identity is then part of TokenRegistry
// export function handleNewMember(event: NewMember): void {
//   let id = event.params.member.toHexString()
//   let token = new Token(id)
//   token.totalVotes = 0
//   token.membershipStartTime = event.params.applicationTime.toI32()
//   token.save()
// }

// export function handleMemberExited(event: MemberExited): void {
//   let id = event.params.member.toHexString()
//   store.remove('Token', id)
// }

// export function handleCharterUpdated(event: CharterUpdated): void {
//   let tokenRegistry = TokenRegistry.load('1')
//   tokenRegistry.charter = event.params.data
//   tokenRegistry.save()
// }

// export function handleWithdrawal(event: Withdrawal): void {
//   let tokenRegistry = TokenRegistry.load('1')
//   tokenRegistry.reserveBankBalance = tokenRegistry.reserveBankBalance.minus(event.params.amount)
//   tokenRegistry.save()
// }

// export function handleEverestDeployed(event: TokenRegistryDeployed): void {
//   let tokenRegistry = new TokenRegistry('1')
//   tokenRegistry.owner = event.params.owner
//   tokenRegistry.approvedToken = event.params.approvedToken
//   tokenRegistry.votingPeriodDuration = event.params.votingPeriodDuration.toI32()
//   tokenRegistry.challengeDeposit = event.params.challengeDeposit
//   tokenRegistry.applicationFee = event.params.applicationFee
//   tokenRegistry.reserveBankAddress = event.params.reserveBank
//   tokenRegistry.reserveBankBalance = BigInt.fromI32(0)
//   tokenRegistry.registry = event.params.registry
//   tokenRegistry.charter = event.params.charter
//   tokenRegistry.save()
// }

// export function handleMemberChallenged(event: MemberChallenged): void {
//   let id = event.params.challengeID.toString()
//   let challenge = new Challenge(id)
//   challenge.endTime = event.params.challengeEndTime.toI32()
//   challenge.votesFor = 0 // Don't need to record one here, since a SubmitVote event will be emitted
//   challenge.votesAgainst = 0
//   challenge.token = event.params.member.toHexString()
//   challenge.owner = event.params.challenger
//   challenge.resolved = false

//   let hexHash = addQm(event.params.details) as Bytes
//   let base58Hash = hexHash.toBase58()
//   let ipfsData = ipfs.cat(base58Hash)
//   if (ipfsData != null) {
//     let data = json.fromBytes(ipfsData as Bytes).toObject()
//     challenge.description = data.get('description').isNull()
//       ? null
//       : data.get('description').toString()
//   }

//   challenge.save()

//   let token = Token.load(event.params.member.toHexString())
//   token.currentChallenge = event.params.challengeID.toString()
//   token.save()

//   let tokenRegistry = TokenRegistry.load('1')
//   tokenRegistry.reserveBankBalance = tokenRegistry.reserveBankBalance.plus(tokenRegistry.challengeDeposit)
//   tokenRegistry.save()
// }

// // event.params.submitter is not in use, it represents a delegate vote
// export function handleSubmitVote(event: SubmitVote): void {
//   let id = event.params.challengeID
//     .toString()
//     .concat('-')
//     .concat(event.params.memberOwner.toHexString())
//   let vote = new Vote(id)
//   let voteChoice = getVoteChoice(event.params.voteChoice)
//   vote.choice = voteChoice
//   vote.weight = event.params.voteWeight.toI32()
//   vote.challenge = event.params.challengeID.toString()
//   vote.voter = event.params.memberOwner.toHexString()
//   vote.save()

//   let challenge = Challenge.load(event.params.challengeID.toString())
//   if (voteChoice == 'Yes') {
//     challenge.votesFor = challenge.votesFor + vote.weight
//   } else if (voteChoice == 'No') {
//     challenge.votesAgainst = challenge.votesAgainst + vote.weight
//   }

//   challenge.save()
// }

// // Note a failed challenge means the Token gets to stay on the list
// export function handleChallengeFailed(event: ChallengeFailed): void {
//   let tokenRegistry = TokenRegistry.load('1')
//   tokenRegistry.reserveBankBalance = tokenRegistry.reserveBankBalance.minus(tokenRegistry.challengeDeposit)
//   tokenRegistry.save()

//   let challenge = Challenge.load(event.params.challengeID.toString())
//   challenge.resolved = true
//   challenge.save()

//   let token = Token.load(event.params.member.toHexString())
//   let pastChallenges = token.pastChallenges
//   pastChallenges.push(token.currentChallenge)
//   token.pastChallenges = pastChallenges
//   token.currentChallenge = null
//   token.save()
// }

// // Note a successful challenge means the token is removed from the list
// export function handleChallengeSucceeded(event: ChallengeSucceeded): void {
//   let tokenRegistry = TokenRegistry.load('1')
//   tokenRegistry.reserveBankBalance = tokenRegistry.reserveBankBalance.minus(tokenRegistry.challengeDeposit)
//   tokenRegistry.save()

//   let challenge = Challenge.load(event.params.challengeID.toString())
//   challenge.resolved = true
//   challenge.save()

//   store.remove('Token', event.params.member.toHexString())
// }

// function getVoteChoice(voteChoice: number): string {
//   let value = 'Null'
//   if (voteChoice == 1) {
//     value = 'Yes'
//   } else if (voteChoice == 2) {
//     value = 'No'
//   }
//   return value
// }
