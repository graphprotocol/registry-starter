/** @jsx jsx */
import { useContext } from 'react'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import { Grid } from '@theme-ui/components'
import { jsx } from 'theme-ui'
import { ReactContext } from '../components/Layout'
import Card from '../components/Card'

const TOKENS_QUERY = gql`
  query tokens($isChallenged: Boolean, $orderBy: TokenOrderByInput) {
    tokens(where: { isChallenged: $isChallenged }, orderBy: $orderBy) {
      id
      symbol
      image
      description
      isChallenged
    }
  }
`

const IndexPage = () => {
  const context = useContext(ReactContext)
  let variables =
    context && context.filter === 'Challenged' ? { isChallenged: true } : {}
  variables =
    context && context.order
      ? { ...variables, orderBy: context.order }
      : { ...variables }

  const { data, loading } = useQuery(TOKENS_QUERY, {
    variables: variables,
  })

  if (loading) {
    return <div />
  }

  return (
    <Grid columns={[2, 3, 4, 5, 6]} gap={[2, 2, 4, 6]}>
      {data.tokens.map(token => (
        <Card id={token.id} title={token.symbol} image={token.image} />
      ))}
    </Grid>
  )
}

export default IndexPage
