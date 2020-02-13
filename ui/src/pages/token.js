/** @jsx jsx */
import { Fragment, useState, useEffect } from 'react'
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
import TokenList from '../components/Select/TokenList'
import { navigate } from 'gatsby'

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
  const [isChallengeOpen, setIsChallengeOpen] = useState(false)
  const [showChallengeDialog, setShowChallengeDialog] = useState(false)
  const [showKeepDialog, setShowKeepDialog] = useState(false)
  const [showRemoveDialog, setShowRemoveDialog] = useState(false)
  const [isChallengeDisabled, setIsChallengeDisabled] = useState(false)
  const [challenge, setChallenge] = useState({
    description: '',
    token: null,
  })
  const [tokensVoted, setTokensVoted] = useState([])
  const [choice, setChoice] = useState('')

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
    setShowChallengeDialog(false)
  }

  const handleVote = choice => {
    console.log('Handle choice clicked: ', choice)
    if (choice === 'yes') {
      setShowKeepDialog(false)
    } else {
      setShowRemoveDialog(false)
    }
    setChoice(choice)
  }

  const tokenId = location ? location.pathname.split('/').slice(-1)[0] : ''
  const { loading, error, data } = useQuery(TOKEN_QUERY, {
    variables: {
      id: tokenId,
    },
  })

  if (loading && !error) {
    return <div />
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
          menuStyles={{ top: '60px', right: '0' }}
          items={[
            {
              text: 'Challenge',
              handleSelect: value => {
                setShowChallengeDialog(true)
              },
              icon: '/challenge.png',
            },
            {
              text: 'Edit',
              handleSelect: value => {
                navigate(`/edit/${token.id}`)
              },
              icon: '/edit.png',
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
          {showChallengeDialog && (
            <Dialog
              title="Challenge"
              description="Challenge to remove token. Price: 10 DAI, etc etc"
              showDialog={showChallengeDialog}
              closeDialog={() => setShowChallengeDialog(false)}
              showMask={isChallengeOpen}
            >
              <Select
                title="Challenge on behalf of"
                selected={
                  challenge.token ? challenge.token.symbol : 'Select a token'
                }
                isPlaceholder={!challenge.token}
                tokens={token.owner.tokens}
                setValue={value => setValue('token', value)}
                setOpen={setIsChallengeOpen}
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
          {showKeepDialog && (
            <Dialog
              title="Keep"
              description={`You are voting to keep ${token.symbol}`}
              showDialog={showKeepDialog}
              closeDialog={() => setShowKeepDialog(false)}
            >
              <TokenList
                title="Vote on behalf of"
                tokens={token.owner.tokens}
                setIsOpen={value => setShowKeepDialog(value)}
                isMultiselect={true}
                selected={tokensVoted}
                setValue={value => setTokensVoted(value)}
              />
              <Divider sx={{ mb: 3 }} />
              <Button
                variant="primary"
                text="Submit"
                isDisabled={tokensVoted.length === 0}
                onClick={() => handleVote('yes')}
                sx={{ ml: 'auto' }}
              />
            </Dialog>
          )}
          {showRemoveDialog && (
            <Dialog
              title="Remove"
              description={`You are voting to remove ${token.symbol}`}
              showDialog={showRemoveDialog}
              closeDialog={() => setShowRemoveDialog(false)}
            >
              <TokenList
                title="Vote on behalf of"
                tokens={token.owner.tokens}
                setIsOpen={value => setShowRemoveDialog(value)}
                isMultiselect={true}
                selected={tokensVoted}
                setValue={value => setTokensVoted(value)}
              />
              <Divider sx={{ mb: 3 }} />
              <Button
                variant="primary"
                text="Submit"
                isDisabled={tokensVoted.length === 0}
                onClick={() => handleVote('no')}
                sx={{ ml: 'auto' }}
              />
            </Dialog>
          )}
        </Box>
        <Box
          sx={{
            margin: ['32px auto', '32px auto', 0],
            maxWidth: '400px',
            width: '100%',
          }}
        >
          {token.isChallenged && (
            <Fragment>
              <Box>
                <Styled.h5 sx={{ mb: 4 }}>Active Challenge</Styled.h5>
                <Grid columns={['1fr 1fr max-content', 3]} gap={3} my={5}>
                  <Box>
                    <p sx={{ variant: 'text.smaller' }}>Ends in</p>
                    <Styled.p>3d 6h</Styled.p>
                  </Box>
                  <Box>
                    <p sx={{ variant: 'text.smaller' }}>Votes</p>
                    <Styled.p>{token.totalVotes}</Styled.p>
                  </Box>
                  <Box>
                    <p sx={{ variant: 'text.smaller' }}>Challenged by</p>
                    <Link to={`/profile/${token.owner.id}`}>
                      <Styled.p
                        sx={{ color: 'secondary', fontWeight: 'heading' }}
                      >
                        {`${token.owner.id.slice(
                          0,
                          6
                        )}...${token.owner.id.slice(-6)}`}
                      </Styled.p>
                    </Link>
                  </Box>
                </Grid>
                <Box my={5}>
                  <p sx={{ variant: 'text.smaller' }}>Description</p>
                  <Styled.p>{description}</Styled.p>
                </Box>
                {(choice.length === 0 || tokensVoted.length === 0) && (
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
                      <Button
                        variant="secondary"
                        text="Keep"
                        onClick={() => setShowKeepDialog(true)}
                      />
                      <Button
                        variant="secondary"
                        text="Remove"
                        onClick={() => setShowRemoveDialog(true)}
                      />
                    </Grid>
                  </Box>
                )}
              </Box>
              {choice.length > 0 && tokensVoted.length > 0 && (
                <Box>
                  <p sx={{ variant: 'text.smaller' }}>Your votes</p>
                  <Grid
                    sx={{
                      gridTemplateColumns: '30px 1fr max-content',
                      alignItems: 'center',
                      my: 4,
                    }}
                  >
                    <img
                      src="/user.png"
                      alt="Token"
                      sx={{
                        height: '24px',
                        width: '24px',
                        objectFit: 'contain',
                      }}
                    />
                    <Styled.p
                      sx={{
                        textTransform: 'capslock',
                        fontWeight: 'heading',
                      }}
                    >
                      {choice === 'yes' ? 'Keep' : 'Remove'}
                    </Styled.p>
                    <Link
                      onClick={() => {
                        if (choice === 'yes') {
                          setShowKeepDialog(true)
                        } else {
                          setShowRemoveDialog(true)
                        }
                      }}
                    >
                      Add vote
                    </Link>
                  </Grid>
                  <Divider />
                  {tokensVoted.map(tokenVoted => (
                    <Grid
                      sx={{
                        gridTemplateColumns: '30px 1fr max-content',
                        alignItems: 'center',
                        my: 4,
                      }}
                    >
                      <img
                        src={tokenVoted.image}
                        alt="Token"
                        sx={{
                          height: '24px',
                          width: '24px',
                          objectFit: 'contain',
                        }}
                      />
                      <Styled.p
                        sx={{
                          textTransform: 'capslock',
                        }}
                      >
                        {tokenVoted.symbol}
                      </Styled.p>
                      <Styled.p
                        sx={{
                          variant: 'text.smaller',
                        }}
                      >
                        2020-02-07
                      </Styled.p>
                    </Grid>
                  ))}
                </Box>
              )}
            </Fragment>
          )}
        </Box>
      </Grid>
    </Grid>
  )
}

export default Token
