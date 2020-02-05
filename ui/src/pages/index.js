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
    <Grid columns={[2, 3, 4, 5, 6]} gap={[2, 2, 4, 6]}>
      {data.tokens.map(token => (
        <Box
          key={token.id}
          sx={{
            height: ['160px', '180px', '180px'],
            width: ['160px', '180px', '180px'],
            border: '2px solid',
            borderColor: 'rgba(9,6,16,0.08)',
            backgroundColor: 'white',
            justifySelf: 'center',
            textAlign: 'center',
            paddingTop: '24px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            '&:hover': {
              borderColor: 'secondary',
              transition: 'all 0.3s ease',
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
              objectFit: 'contain',
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
