/** @jsx jsx */
import React from 'react'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import { Grid } from '@theme-ui/components'
import { jsx, Styled, Box } from 'theme-ui'

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

console.log('LAYOUT: ', Layout)

const IndexPage = () => {
  const { data } = useQuery(TOKENS_QUERY)
  console.log('DATA: ', data)
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
          }}
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
          />
          {token.symbol}
        </Box>
      ))}
    </Grid>
  )
}

export default IndexPage
