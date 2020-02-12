import gql from 'graphql-tag'

export const TEST_RESOLVER = gql`
    mutation testResolve {
        testResolve @client
    }
`
