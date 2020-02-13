import { gql } from 'apollo-boost'

export const TOKENS_QUERY = gql`
  query tokens(
    $where: Token_filter
    $orderBy: Token_orderBy
    $orderDirection: OrderDirection
  ) {
    tokens(where: $where, orderBy: $orderBy, orderDirection: $orderDirection) {
      id
      symbol
      image
      description
      isChallenged
    }
  }
`

export const TOKEN_QUERY = gql`
  query token($id: ID!) {
    token(where: { id: $id }) {
      id
      symbol
      image
      description
      decimals
      address
    }
  }
`

export const ADD_TOKEN = gql`
  mutation addToken(
    $symbol: String!
    $description: String!
    $image: String
    $decimals: Int
    $address: String
  ) {
    addToken(
      symbol: $symbol
      description: $description
      image: $image
      decimals: $decimals
      address: $address
    ) @client
  }
`

export const EDIT_TOKEN = gql`
  mutation editToken(
    $symbol: String!
    $description: String!
    $image: String
    $decimals: Int
    $address: String
  ) {
    editToken(
      symbol: $symbol
      description: $description
      image: $image
      decimals: $decimals
      address: $address
    ) @client
  }
`

export const PROFILE_QUERY = gql`
  query profile($id: ID!) {
    user(id: $id) {
      id
      name
      bio
      tokens {
        id
        symbol
        image
      }
      challenges {
        id
        token {
          symbol
          image
        }
      }
      votes {
        id
        challenge {
          token {
            symbol
            image
          }
        }
      }
    }
  }
`
