/** @jsx jsx */
import { useState } from 'react'
import { Styled, jsx, Box } from 'theme-ui'
import { Grid } from '@theme-ui/components'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

import Divider from '../components/Divider'
import Link from '../components/Link'
import Button from '../components/Button'

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
      totalVotes
      owner {
        id
      }
      challenges {
        id
        resolved
        description
      }
    }
  }
`

const Token = ({ location }) => {
  const [isKeepOpen, setIsKeepOpen] = useState(false)
  const [isRemoveOpen, setIsRemoveOpen] = useState(false)
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

  let description
  if (token.isChallenged) {
    const activeChallenge = token.challenges.find(
      challenge => challenge.resolved === false
    )
    description = activeChallenge ? activeChallenge.description : ''
  }

  return (
    <Grid>
      <Grid sx={{ gridTemplateColumns: '80px 1fr', mb: 4 }} gap={2}>
        <img
          src={token.image}
          alt="Token"
          sx={{ height: '80px', width: '80px', objectFit: 'contain' }}
        />
        <Styled.h1 sx={{ my: 2 }}>{token.symbol}</Styled.h1>
      </Grid>
      <Divider />
      <Grid columns={[1, 1, 2]} gap={0} mt={5}>
        <Box>
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
        <Box sx={{ margin: ['32px auto', '32px auto', 0], maxWidth: '400px' }}>
          {token.isChallenged && (
            <Box>
              <Styled.h5 sx={{ mb: 4 }}>Active Challenge</Styled.h5>
              <Grid columns={3} gap={3} my={5}>
                <Box>
                  <p sx={{ variant: 'text.smaller' }}>Ends in</p>
                  <Styled.p>3d 6h</Styled.p>
                </Box>
                <Box>
                  <p sx={{ variant: 'text.smaller' }}>Voters</p>
                  <Styled.p>{token.totalVotes}</Styled.p>
                </Box>
                <Box>
                  <p sx={{ variant: 'text.smaller' }}>Challenged by</p>
                  <Link to={`/profile/${token.owner.id}`}>
                    <Styled.p
                      sx={{ color: 'secondary', fontWeight: 'heading' }}
                    >
                      {`${token.owner.id.slice(0, 6)}...${token.owner.id.slice(
                        -6
                      )}`}
                    </Styled.p>
                  </Link>
                </Box>
              </Grid>
              <Box my={5}>
                <p sx={{ variant: 'text.smaller' }}>Description</p>
                <Styled.p>{description}</Styled.p>
              </Box>
              <Box my={5}>
                <p sx={{ variant: 'text.smaller' }}>Vote</p>
                <Grid
                  columns={2}
                  sx={{
                    mt: 1,
                    mb: 6,
                    gridTemplateColumns: 'max-content max-content',
                  }}
                >
                  {/* <MultiSelect
                    setValue={projects => voteOnProject(projects, 'keep')}
                    title="Vote on behalf of"
                    subtitle="You can select multiple projects"
                    items={userData ? userData.user.projects : []}
                    variant="round"
                    setOpen={value => {
                      setIsKeepOpen(value)
                    }}
                    styles={{
                      pointerEvents: isRemoveOpen ? 'none' : 'all',
                      cursor: isRemoveOpen ? 'auto' : 'pointer',
                    }}
                  > */}
                  <Button
                    variant="secondary"
                    text="Keep"
                    sx={{
                      backgroundColor: isKeepOpen ? 'secondary' : 'white',
                      color: isKeepOpen ? 'white' : 'secondary',
                      opacity: isRemoveOpen ? 0.48 : 1,
                    }}
                  />
                  {/* <MultiSelect
                  setValue={projects => voteOnProject(projects, 'remove')}
                  title="Vote on behalf of"
                  subtitle="You can select multiple projects"
                  items={userData ? userData.user.projects : []}
                  variant="round"
                  setOpen={value => {
                    setIsRemoveOpen(value)
                  }}
                  styles={{
                    pointerEvents: isKeepOpen && 'none',
                    cursor: isKeepOpen && 'auto',
                  }}
                > */}
                  <Button
                    variant="secondary"
                    text="Remove"
                    sx={{
                      backgroundColor: isRemoveOpen ? 'secondary' : 'white',
                      color: isRemoveOpen ? 'white' : 'secondary',
                      opacity: isKeepOpen ? 0.48 : 1,
                    }}
                  />
                </Grid>
              </Box>
            </Box>
          )}
        </Box>
      </Grid>
    </Grid>
  )
}

export default Token
