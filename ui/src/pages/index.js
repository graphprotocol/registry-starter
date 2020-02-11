/** @jsx jsx */
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import { Grid } from '@theme-ui/components'
import { jsx, Box } from 'theme-ui'

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
    return (
      <Grid columns={[2, 3, 4, 5, 6]} gap={[2, 2, 4, 6]}>
        {[1, 2, 3, 4, 5, 6].map(num => (
          <Box
            sx={{
              height: ['160px', '180px', '180px'],
              width: ['160px', '180px', '180px'],
              backgroundColor: 'rgba(30, 37, 44, 0.16)',
              justifySelf: 'center',
            }}
          />
        ))}
      </Grid>
    )
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
