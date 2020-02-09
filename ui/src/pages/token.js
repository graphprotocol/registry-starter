/** @jsx jsx */
import { useState, useEffect } from 'react'
import { Styled, jsx, Box } from 'theme-ui'
import { Grid } from '@theme-ui/components'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

import Divider from '../components/Divider'
import Link from '../components/Link'
import Button from '../components/Button'
import Dialog from '../components/Modal/Dialog'
import Select from '../components/Select'
import Field from '../components/Field'
import Menu from '../components/Select/Menu'

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
        tokens {
          id
          symbol
          image
        }
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
  const [showChallengeDialog, setShowChallengeDialog] = useState(false)
  const closeChallengeDialog = () => setShowChallengeDialog(false)
  const [isChallengeDisabled, setIsChallengeDisabled] = useState(false)
  const [challenge, setChallenge] = useState({
    description: '',
    token: null,
  })

  const setValue = (field, value) => {
    setChallenge(state => ({
      ...state,
      [field]: value,
    }))
  }

  useEffect(() => {
    setIsChallengeDisabled(
      !(challenge.description.length > 0 && challenge.token !== null)
    )
  }, [challenge])

  const handleChallenge = () => {
    // TODO: call challenge function
    console.log('Handle challenge clicked')
    closeChallengeDialog()
  }

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
      <Grid sx={{ gridTemplateColumns: '80px 1fr 64px', mb: 4 }} gap={2}>
        <img
          src={token.image}
          alt="Token"
          sx={{ height: '80px', width: '80px', objectFit: 'contain' }}
        />
        <Styled.h1 sx={{ my: 2 }}>{token.symbol}</Styled.h1>
        <Menu
          top="60px"
          right="0"
          items={[
            {
              text: 'Challenge',
              handleSelect: value => {
                setShowChallengeDialog(true)
              },
              icon: '/challenge.png',
            },
          ]}
        >
          <Box
            sx={{
              backgroundColor: 'white',
              boxShadow: '0 4px 24px 0 rgba(30,37,44,0.16)',
              position: 'relative',
              height: '64px',
              width: '64px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                transition: 'all 0.3s ease',
                boxShadow: '0px 0px 35px 0 rgba(30,37,44,0.16)',
              },
            }}
          >
            <img
              src="/dots.png"
              sx={{
                position: 'absolute',
                top: 'calc(50% - 12px)',
                height: '24px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                left: 0,
                right: 0,
                margin: '0 auto',
              }}
              alt="dots icon"
            />
          </Box>
        </Menu>
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
          <Link to={`/edit/${token.id}`} sx={{ color: 'secondary', mt: 5 }}>
            EDIT (placeholder)
          </Link>
          {showChallengeDialog && (
            <Dialog
              title="Challenge"
              description="Challenge to remove token. Price: 10 DAI, etc etc"
              showDialog={showChallengeDialog}
              closeDialog={closeChallengeDialog}
            >
              <Select
                title="Challenge on behalf of"
                selected={
                  challenge.token ? challenge.token.symbol : 'Select a token'
                }
                isPlaceholder={!challenge.token}
                tokens={token.owner.tokens}
                setValue={setValue}
                sx={{ mb: 6 }}
              />
              <Field
                type="textarea"
                title="Description"
                placeholder="Describe the token"
                charsCount={300}
                value={challenge.description}
                setValue={value => setValue('description', value)}
              />
              <Button
                variant="primary"
                text="Challenge"
                isDisabled={isChallengeDisabled}
                onClick={handleChallenge}
              />
            </Dialog>
          )}
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
