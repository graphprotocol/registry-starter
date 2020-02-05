/** @jsx jsx */
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import { Grid } from '@theme-ui/components'
import { jsx } from 'theme-ui'

import Card from '../components/Card'

const TOKENS_QUERY = gql`
  query tokens {
    tokens {
      id
      symbol
      image
      description
      isChallenged
    }
  }
`

const IndexPage = () => {
  const { data } = useQuery(TOKENS_QUERY)
  if (!data) {
    return <p>loading</p>
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
