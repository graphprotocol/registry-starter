import {
  Mutation,
  useMutation,
} from '../src'

import gql from 'graphql-tag'

const EXAMPLE = gql`
  mutation example($input: String!) {
    example(input: $input) @client{
      output
    }
  }
`

export function Component() {
  const [exec, { state }] = useMutation(
    EXAMPLE,
    {
      variables: {
        input: "..."
      }
    }
  )

  return (
    <Mutation mutation={EXAMPLE}>
    {(exec, { state }) => (
      <div>
        {state.example ? state.example.progress : ""}
      </div>
    )}
    </Mutation>
  )
}