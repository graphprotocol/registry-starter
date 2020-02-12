import { execute, makePromise } from 'apollo-link'
import { HttpLink } from 'apollo-link-http'
import gql from 'graphql-tag'

const GET_DATASOURCE = gql`
  query GetDataSource($subgraph: String, $dataSource: String) {
    subgraphs {
      currentVersion {
        deployment {
          manifest {
            dataSources (where: {name: $dataSource}) {
              source {
                address
                abi
              }
            }
          }
        }
      }
    }
  }
`

const GET_CONTRACT_ABIS = gql`
  query GetContractAbis($name: String) {
    ethereumContractAbis (where: {name: $name}) {
        file
      }
    }
`

export const getDataSource = async (link: HttpLink, subgraph: string, dataSource: string) => {
  return await makePromise(
    execute(link, {
      query: GET_DATASOURCE,
      variables: {
        subgraph,
        dataSource
      }
    })
  )
}

export const getContractAbis = async (link: HttpLink, name: string) => {
  return await makePromise(
    execute(link, {
      query: GET_CONTRACT_ABIS,
      variables: {
        name
      }
    })
  )
}
