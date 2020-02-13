/** @jsx jsx */
import { useContext } from 'react'
import { useQuery } from '@apollo/react-hooks'
import { Grid } from '@theme-ui/components'
import { jsx } from 'theme-ui'
import { ReactContext } from '../components/Layout'
import Card from '../components/Card'
import { TOKENS_QUERY } from '../apollo/queries'

const IndexPage = () => {
  const context = useContext(ReactContext)
  let variables =
    context && context.filter === 'Challenged' ? { isChallenged: true } : {}
  variables =
    context && context.order
      ? { ...variables, orderBy: context.order }
      : { ...variables }

  const { data, loading, error } = useQuery(TOKENS_QUERY, {
    variables: variables,
  })

  if (loading || !data) {
    return <div />
  }

  if (error) {
    console.error('Error with Apollo query: ', error)
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
