/** @jsx jsx */
import { useState, useEffect, Fragment } from 'react'
import { Styled, jsx, Box } from 'theme-ui'
import { Grid } from '@theme-ui/components'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import { useWeb3React } from '@web3-react/core'
// import ThreeBox from '3box'

import { metamaskAccountChange } from '../services/ethers'

import Divider from '../components/Divider'
import Section from '../components/Section'
import Card from '../components/Card'
import Button from '../components/Button'

const PROFILE_QUERY = gql`
  query profile($id: ID!) {
    user(where: { id: $id }) {
      id
      name
      bio
      tokens {
        id
        symbol
        image
      }
      challenges {
        id
        token {
          symbol
          image
        }
      }
      votes {
        id
        challenge {
          token {
            symbol
            image
          }
        }
      }
    }
  }
`

const Profile = ({ location }) => {
  const [profile, setProfile] = useState(null)

  const { account } = useWeb3React()

  useEffect(() => {
    async function getProfile() {
      //   const threeBoxProfile = await ThreeBox.getProfile(account)
      //   const threeBoxAccounts = await ThreeBox.getVerifiedAccounts(
      //     threeBoxProfile
      //   )
      //   if (threeBoxProfile && Object.keys(threeBoxProfile).length > 0) {
      //     setProfile(state => ({
      //       ...state,
      //       ...threeBoxProfile,
      //       accounts: threeBoxAccounts,
      //     }))
      //   }
    }
    metamaskAccountChange(() => {
      if (typeof window !== 'undefined') {
        window.location.href = '/'
      }
    })
    getProfile()
  }, [account])

  const profileId = location ? location.pathname.split('/').slice(-1)[0] : ''

  const { loading, error, data } = useQuery(PROFILE_QUERY, {
    variables: {
      id: profileId,
    },
  })

  if (loading && !error) {
    return <div />
  }

  const user = data.user

  const displayProfileId = profileId.slice(0, 6) + '...' + profileId.slice(-6)

  return (
    <Grid>
      <Grid columns={[1, 1, 2]} gap={0} sx={{ alignItems: 'center' }}>
        <Grid
          sx={{
            gridTemplateColumns: '80px 1fr',
            alignItems: 'center',
          }}
        >
          <Box>
            <img
              src="/user.png"
              alt="User"
              sx={{ height: '72px', width: '72px', borderRadius: '50%' }}
            />
          </Box>
          <Box sx={{ fontWeight: 'heading' }}>
            <Styled.h2>{profile ? profile.name : ''}</Styled.h2>
            {profile && profile.name ? (
              <Styled.p>{displayProfileId}</Styled.p>
            ) : (
              <Styled.h1
                sx={{
                  fontSize: ['2rem', '3.375rem'],
                  letterSpacing: ['-0.8px', '2px'],
                }}
              >
                {displayProfileId}
              </Styled.h1>
            )}
          </Box>
        </Grid>
        <Grid
          sx={{
            gridTemplateColumns: 'max-content',
            justifyContent: 'flex-end',
            textAlign: ['left', profile ? 'center' : 'right'],
          }}
          mt={[5, 5, 0]}
        ></Grid>
      </Grid>
      <Divider sx={{ my: 4 }} />
      <Grid columns={[1, 1, 2]} gap={5}>
        <Box>
          {profile && profile.description && (
            <Styled.p>{profile.description}</Styled.p>
          )}
        </Box>
      </Grid>
      {user && user.tokens && user.tokens.length > 0 ? (
        <Fragment>
          <Section
            items={user.tokens}
            title="Your Tokens"
            subtitle={`${user.tokens.length} Tokens`}
          />
          {user.challenges.length > 0 && (
            <Section
              items={user.challenges.map(challenge => ({
                symbol: challenge.token.symbol,
                image: challenge.token.image,
              }))}
              title="Your Active Challenges"
              subtitle={`${user.challenges.length} Challenges`}
            />
          )}
          {user.votes.length > 0 && (
            <Section
              items={user.votes.map(votes => ({
                symbol: votes.challenge.token.symbol,
                image: votes.challenge.token.image,
              }))}
              title="Your Active Votes"
              subtitle={`${user.votes.length} Votes`}
            />
          )}
        </Fragment>
      ) : (
        <Box sx={{ textAlign: 'center', margin: '50px auto 0' }}>
          <img src="/logo-faded.svg" />
          <Styled.p sx={{ opacity: 0.64, mt: 3 }}>You have no tokens</Styled.p>
          <Button
            text="Add a Token"
            to="/tokens/new"
            variant="primary"
            sx={{ m: '0 auto', mt: 5 }}
          />
        </Box>
      )}
    </Grid>
  )
}

export default Profile
