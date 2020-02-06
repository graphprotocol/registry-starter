/** @jsx jsx */
import { useState, useEffect } from 'react'
import { Styled, jsx, Box } from 'theme-ui'
import { Grid } from '@theme-ui/components'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import { useWeb3React } from '@web3-react/core'
// import ThreeBox from '3box'

import { metamaskAccountChange } from '../services/ethers'

import Divider from '../components/Divider'
import Card from '../components/Card'

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
    }
  }
`

const Profile = ({ location }) => {
  const [profile, setProfile] = useState(null)

  const { account } = useWeb3React()

  useEffect(() => {
    async function getProfile() {
      console.log('account: ', account)
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
    return <Styled.p>Loading</Styled.p>
  }

  const user = data.user

  const displayProfileId =
    profileId.slice(0, 6) +
    '...' +
    profileId.slice(profileId.length - 6, profileId.length)

  return (
    <Grid>
      <Grid columns={[1, 1, 2]} gap={0} sx={{ alignItems: 'center' }}>
        <Grid
          sx={{
            gridTemplateColumns: [1, '80px 1fr'],
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
              <Styled.h1>{displayProfileId}</Styled.h1>
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
      <Grid columns={[1, 2, 2]} mb={1} mt={1}>
        <Box>
          <Styled.h4>Your Tokens</Styled.h4>
          <Styled.p sx={{ opacity: 0.64, color: 'rgba(9,6,16,0.5)' }}>
            {user && user.tokens && user.tokens.length > 0 && (
              <span>{user.tokens.length} Tokens</span>
            )}
          </Styled.p>
        </Box>
      </Grid>
      {user && user.tokens.length > 0 && (
        <Grid columns={[2, 3, 4, 5, 6]} gap={[2, 2, 4, 6]}>
          {user.tokens.map(token => (
            <Card id={token.id} title={token.symbol} image={token.image} />
          ))}
        </Grid>
      )}
      {/* TODO: Replace with challenges  */}
    </Grid>
  )
}

export default Profile
