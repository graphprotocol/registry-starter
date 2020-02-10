import { json, ipfs, Bytes } from '@graphprotocol/graph-ts'
import {
  DIDOwnerChanged,
  DIDAttributeChanged,
} from '../types/EthereumDIDRegistry/EthereumDIDRegistry'
import { Token } from '../types/schema'
import { addQm } from './helpers'

// Projects are created in handleNewMember()
// If a token is null, it was not added to tokenRegistry and we want to ignore it
// This allows the subgraph to only create data on TokenRegistry identities in
// the ethereumDIDRegistry, and ignore any other identity that has ever been created
// event.params.previousChange is not in use
export function handleDIDOwnerChanged(event: DIDOwnerChanged): void {
  let id = event.params.identity.toHexString()
  let token = Token.load(id)
  if (token != null) {
    token.owner = event.params.owner.toHexString()
    token.save()
  }
}

/*
  DIDAttributeChanged
    - is just an event emitted (no contract storage). So whenever there is a new
    event emitted, the subgraph just overwrites the previous data

  event.params.previousChange
    - is not in use

  event.params.name
    - can be customized. To start, the tokenRegistry front end will use :
    bytes32("TokenInfo") = 
    0x546f6b656e446174610000000000000000000000000000000000000000000000
    - note there are 46 zeros at the end

  event.params.validTo
    - The TokenRegistry front end should pass max validity, which would be
    0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
    - Note we must pass a value. The subgraph does not handle this value at all, it only considers 
    the most recent DIDAttribute as the correct one
*/
export function handleDIDAttributeChanged(event: DIDAttributeChanged): void {
  let id = event.params.identity.toHexString()
  let token = Token.load(id)
  if (token != null) {
    if (
      event.params.name.toHexString() ==
      '0x546f6b656e446174610000000000000000000000000000000000000000000000'
    ) {
      // TODO - ponential for crashing? Because value is not forced to be 32 bytes. This is an
      // edge case because it has to be an identity, then it has to be called outside of the
      // tokenRegistry front end
      let hexHash = addQm(event.params.value) as Bytes
      let base58Hash = hexHash.toBase58()
      token.ipfsHash = base58Hash

      let ipfsData = ipfs.cat(base58Hash)
      if (ipfsData != null) {
        let data = json.fromBytes(ipfsData as Bytes).toObject()
        token.symbol = data.get('symbol').isNull() ? null : data.get('symbol').toString()
        token.description = data.get('description').isNull()
          ? null
          : data.get('description').toString()
        token.image = data.get('image').isNull() ? null : data.get('image').toString()
        token.decimals = data.get('decimals').isNull()
          ? null
          : data.get('decimals').toString()
        token.address = data.get('address').isNull()
          ? null
          : data.get('address').toString()
      }
    }
    token.save()
  }
}
