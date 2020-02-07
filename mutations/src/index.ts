// import {
//   EventPayload,
//   MutationContext,
//   MutationResolvers,
//   MutationState,
//   StateBuilder,
//   StateUpdater,
// } from "@graphprotocol/mutations"

import gql from 'graphql-tag'
const IpfsClient = require('ipfs-http-client')
import { ethers } from 'ethers'
import { Transaction } from 'ethers/utils'
import {
  AsyncSendable,
  Web3Provider
} from "ethers/providers"

// State Payloads + Events + StateBuilder
// interface CustomEvent extends EventPayload {
//   myValue: string
// }

// type EventMap = {
//   'CUSTOM_EVENT': CustomEvent
// }

// interface State {
//   myValue: string
//   myFlag: boolean
// }

// const stateBuilder: StateBuilder<State, EventMap> = {
//   getInitialState(): State {
//     return {
//       myValue: '',
//       myFlag: false
//     }
//   },
//   reducers: {
//     'CUSTOM_EVENT': async (state: MutationState<State>, payload: CustomEvent) => {
//       return {
//         myValue: 'true'
//       }
//     }
//   }
// }

// Configuration
type Config = typeof config

const config = {
  ethereum: (provider: AsyncSendable): Web3Provider => {
    return new Web3Provider(provider)
  },
  ipfs: (endpoint: string) => {
    return new IpfsClient(endpoint)
  },
  // Example of a custom configuration property
  property: {
    // Property setters can be nested
    a: (value: string) => { },
    b: (value: string) => { }
  }
}

//type Context = MutationContext<Config, State, EventMap>

// async function queryUserGravatar(context: any) {
//   const { client } = context
//   const { ethereum } = context.graph.config

//   const address = await ethereum.getSigner().getAddress()

//   if (client) {
//     // TODO time travel query (specific block #)
//     // block: hash#?
//     for (let i = 0; i < 20; ++i) {
//       const { data } = await client.query({
//         query: gql`
//           query GetGravatars {
//             gravatars (where: {owner: "${address}"}) {
//               id
//               owner
//               displayName
//               imageUrl
//             }
//           }`
//         }
//       )

//       if (data === null) {
//         await sleep(500)
//       } else {
//         return data.gravatars[0]
//       }
//     }
//   }

//   return null
// }

async function sendTx(tx: Transaction) {
  try {
    return await tx;
  } catch (error) {
    console.log(error)
  }
}

async function getTokenRegistryContract(context: any) {
  const abi = require("../../contracts/abis/TokenRegistry.abi")
  const address = "0x0290FB167208Af455bB137780163b7B7a9a10C16"

  if (!abi || !address) { 
    throw Error(`Missing the DataSource 'TokenRegistry'`)
  }

  const { ethereum } = context.graph.config

  const contract = new ethers.Contract(
    address, abi, ethereum.getSigner? ethereum.getSigner: ethereum
  )
  contract.connect(ethereum)

  return contract
}

async function addToken(_, { options }: any, context: any) {

  const { ipfs } = context.graph.config

  const { symbol, description, image, decimals } = options

  const metadata = JSON.stringify(
    { symbol,
      description,
      image,
      decimals
    }
  )

  for await (const result of ipfs.add(metadata)) {
    console.log(result)
  }

  // const tokenRegistry = await getTokenRegistryContract(context)

  // await sendTx(
  //   await tokenRegistry.applySignedWithAttribute()
  // )

  return null;
}

const resolvers: any = {
  Mutation: {
    addToken
  }
}

export default {
  resolvers,
  config
}

// Required Types
// export {
//   State,
//   EventMap,
//   CustomEvent
// }

// function sleep(ms: number): Promise<void> {
//   return new Promise(resolve => setTimeout(resolve, ms));
// }