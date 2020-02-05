/** @jsx jsx */
import { useState, useEffect } from 'react'
import { jsx, Styled } from 'theme-ui'
import { Grid } from '@theme-ui/components'
import { useWeb3React } from '@web3-react/core'

import { metamaskAccountChange } from '../../services/ethers'
import Link from '../Link'
import Modal from '../../components/Modal'

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
      <Grid>
        {userAccount ? (
          <Link
            to={`/profile/ck670yk6d8u490935r8v72pa6`} //should be userAccount
            sx={{ '&:hover': { svg: { marginLeft: 0 } } }}
          >
            <img
              src="/user.png"
              alt="User"
              sx={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                verticalAlign: 'middle',
              }}
            />
          </Link>
        ) : (
          <Modal showModal={showModal} closeModal={closeModal}>
            <Link onClick={() => openModal()}>Sign In </Link>
          </Modal>
        )}
      </Grid>
    </Grid>
  )
}
