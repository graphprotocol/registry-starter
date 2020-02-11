/** @jsx jsx */
import { useState, useEffect, Fragment } from 'react'
import { jsx, Styled, Box } from 'theme-ui'
import { Grid } from '@theme-ui/components'
import { useWeb3React } from '@web3-react/core'
import { navigate } from 'gatsby'

import { metamaskAccountChange } from '../../services/ethers'
import Link from '../Link'
import SignupModal from '../../components/Modal'
import Menu from '../../components/Select/Menu'

export default ({ children, mainStyles, ...props }) => {
  const { account } = useWeb3React()
  const [showModal, setShowModal] = useState(false)
  const [userAccount, setUserAccount] = useState(account)
  const openModal = () => setShowModal(true)

  const closeModal = () => {
    if (account) {
      setUserAccount(account)
    }
    setShowModal(false)
  }

  useEffect(() => {
    if (account) {
      setUserAccount(account)
    }
    metamaskAccountChange(accounts => setUserAccount(accounts[0]))
  }, [account])

  return (
    <Grid
      sx={{
        gridTemplateColumns: '1fr max-content',
        justifyContent: 'space-between',
        height: '128px',
        alignItems: 'center',
      }}
      {...props}
    >
      <Grid
        sx={{
          gridTemplateColumns: 'max-content max-content',
          alignItems: 'center',
        }}
        gap={2}
      >
        <Link to={'/'}>
          <img
            src="/logo.svg"
            alt="Logo"
            sx={{ width: '24px', height: '24px', verticalAlign: 'middle' }}
          />
        </Link>
        <Styled.h4>
          <Link to={'/'}>Tokens</Link>
        </Styled.h4>
      </Grid>
      <Grid
        columns={userAccount ? [2, 3] : 2}
        sx={{ alignItems: 'center' }}
        gap={0}
      >
        <Link
          to="/tokens/new"
          sx={{
            fontWeight: 'heading',
            fontFamily: 'heading',
            color: 'secondary',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            '&:hover': {
              transition: 'all 0.3s ease',
              color: 'linkHover',
            },
          }}
        >
          {userAccount ? (
            <img
              src="/plus.png"
              alt="plus"
              sx={{ height: '18px', width: 'auto' }}
            />
          ) : (
            <span>Add a token</span>
          )}
        </Link>
        {userAccount ? (
          <Fragment>
            <Link
              to={`/profile/ck670yk6d8u490935r8v72pa6`} //should be userAccount
              sx={{ textAlign: 'right' }}
            >
              <img
                src="/user.png"
                alt="User"
                sx={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  verticalAlign: 'middle',
                  mx: 1,
                }}
              />
            </Link>
            <Menu
              top="25px"
              right="-10px"
              items={[
                {
                  text: 'Your Tokens',
                  handleSelect: () => navigate(`/profile/${userAccount}`),
                  icon: '/user.png',
                },
                {
                  text: (
                    <Fragment>
                      <Box
                        onClick={e => {
                          e.preventDefault()
                          openModal()
                        }}
                      >
                        Change wallet
                      </Box>
                    </Fragment>
                  ),
                  icon: '/challenge.png',
                },
                {
                  text: (
                    <span
                      sx={{
                        fontSize: '0.875rem',
                        lineHeight: '1.25rem',
                        fontWeight: 'body',
                      }}
                    >
                      <img
                        src="/edit.png"
                        alt="Edit"
                        sx={{
                          width: '18px',
                          height: '18px',
                          verticalAlign: 'middle',
                          objectFit: 'contain',
                          marginRight: 4,
                        }}
                      />
                      Edit Profile (3Box)
                    </span>
                  ),
                  handleSelect: () =>
                    window.open(`https://3box.io/${userAccount}`, '_blank'),
                },
              ]}
              sx={{ justifySelf: 'center', cursor: 'pointer' }}
            >
              <Box
                sx={{
                  justifySelf: 'end',
                  height: '9px',
                  width: '9px',
                  borderTop: '2px solid',
                  borderRight: '2px solid',
                  borderColor: 'secondary',
                  transform: 'rotate(135deg)',
                  display: ['none', 'block'],
                }}
              />
            </Menu>
          </Fragment>
        ) : (
          <Box sx={{ justifySelf: 'flex-end' }}>
            <Link onClick={() => openModal()}>Sign In </Link>
          </Box>
        )}
      </Grid>
      {showModal && (
        <SignupModal showModal={showModal} closeModal={closeModal} />
      )}
    </Grid>
  )
}
