/** @jsx jsx */
import { Fragment } from 'react'
import { Styled, jsx, Box } from 'theme-ui'
import { Grid } from '@theme-ui/components'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import { isMobile } from 'react-device-detect'

import Divider from '../components/Divider'
import Link from '../components/Link'

const TOKEN_QUERY = gql`
  query token($id: ID!) {
    token(where: { id: $id }) {
      id
      symbol
      image
      description
      isChallenged
      decimals
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
        }}
      >
        {!isMobile && token.image ? (
          <img
            src={token.image}
            alt="Token"
            sx={{ height: '80px', width: '80px', objectFit: 'contain' }}
          />
        ) : (
          <div />
        )}
        <Box>
          {isMobile ? (
            <Fragment>
              <Grid sx={{ gridTemplateColumns: '80px 1fr', mb: 4 }} gap={2}>
                <img
                  src={token.image}
                  alt="Token"
                  sx={{ height: '80px', width: '80px', objectFit: 'contain' }}
                />
                <Styled.h1 sx={{ my: 2 }}>{token.symbol}</Styled.h1>
              </Grid>
              <Divider />
            </Fragment>
          ) : (
            <Styled.h1 sx={{ my: 2 }}>{token.symbol}</Styled.h1>
          )}
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
          <Styled.p>{token.decimals}</Styled.p>
          <Link to={`edit/${token.id}`} sx={{ color: 'secondary', mt: 5 }}>
            EDIT (placeholder)
          </Link>
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
