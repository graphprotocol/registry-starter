import gql from 'graphql-tag'

export const schema = gql`
  extend type Todo{
      id: ID!
      asignee: String!
      description: String!
      completed: Boolean!
  }
  input CreateInput{
      asignee: String!
      description: String!
  }
  extend type Query{
      getTodos: [Todo]
  }
  extend type Mutation{
      testResolve: Boolean!
  }
`
