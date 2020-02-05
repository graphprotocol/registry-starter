/** @jsx jsx */
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import { Grid } from '@theme-ui/components'
import { jsx, Box, Styled } from 'theme-ui'
import { navigate } from 'gatsby'

import Layout from '../components/Layout'

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
    <Grid columns={[2, 3, 4, 5, 6]} gap={[2, 3]}>
      {data.tokens.map(token => (
        <Box
          key={token.id}
          sx={{
            height: ['160px', '180px', '180px'],
            width: ['160px', '180px', '180px'],
            border: '2px solid rgba(9,6,16,0.08)',
            backgroundColor: 'white',
            justifySelf: 'center',
            textAlign: 'center',
            paddingTop: '24px',
            cursor: 'pointer',
            '&:hover': {
              boxShadow: '0 4px 14px 0 rgba(30,37,44,0.16)',
            },
          }}
          onClick={() => navigate(`/token/${token.id}`)}
        >
          <img
            src={token.image}
            sx={{
              width: '92px',
              height: '92px',
              display: 'block',
              padding: 3,
              boxSizing: 'border-box',
              margin: '0 auto',
            }}
            alt="Token"
          />
          <Styled.h5>{token.symbol}</Styled.h5>
        </Box>
      ))}
    </Grid>
  )
}

export default IndexPage
