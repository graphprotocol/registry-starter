/** @jsx jsx */
import { useState, Fragment } from 'react'
import { Styled, jsx, Box } from 'theme-ui'
import { Grid } from '@theme-ui/components'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

const TOKEN_QUERY = gql`
  query token($id: ID!) {
    token(where: { id: $id }) {
      id
      symbol
      image
      description
      isChallenged
      amount
      address
    }
  }
`

const Token = ({ location }) => {
  const tokenId = location ? location.pathname.split('/').slice(-1)[0] : ''
  const { loading, error, data } = useQuery(TOKEN_QUERY, {
    variables: {
      id: tokenId,
    },
  })

  if (loading && !error) {
    return <Styled.p>Loading</Styled.p>
  }

  if (error) {
    return <Styled.h3>Something went wrong - can't find a token </Styled.h3>
  }

  let token = data && data.token

  return (
    <Grid columns={[1, 1, 2]} gap={0} sx={{ alignItems: 'center' }}>
      <Grid
        sx={{
          gridTemplateColumns: ['1fr', '80px 1fr', '80px 1fr'],
          alignItems: 'flex-start',
          pl: 2,
        }}
      >
        {token.image ? (
          <img
            src={token.image}
            alt="Token"
            sx={{ height: '80px', width: '80px', objectFit: 'contain' }}
          />
        ) : (
          <div />
        )}
        <Box>
          <Styled.h1 sx={{ my: 2 }}>{token.symbol}</Styled.h1>
          <Styled.p>{token.description}</Styled.p>
          <p sx={{ variant: 'text.smaller', mt: 3 }}>ID</p>
          <Styled.h6
            sx={{
              color: 'secondary',
              fontSize: ['0.85rem', '1rem', '1rem', '1rem'],
            }}
          >
            {token.id}
          </Styled.h6>

          <p
            sx={{
              variant: 'text.smaller',
              mt: 3,
            }}
          >
            Contract address
          </p>
          <Styled.h6
            sx={{
              color: 'secondary',
              fontSize: ['0.85rem', '1rem', '1rem', '1rem'],
            }}
          >
            {token.address}
          </Styled.h6>

          <p sx={{ variant: 'text.smaller', mt: 3 }}>Decimals</p>
          <Styled.p>{token.amount}</Styled.p>
        </Box>
      </Grid>
      <Grid
        columns={[1, 2, 2]}
        mt={[5, 5, 0]}
        sx={{ alignItems: 'center' }}
      ></Grid>
    </Grid>
  )
}

export default Token
