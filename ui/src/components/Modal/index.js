/** @jsx jsx */
import PropTypes from 'prop-types'
import { useState, Fragment, useEffect } from 'react'
import { Styled, jsx, Box } from 'theme-ui'
import { Grid } from '@theme-ui/components'
import { Dialog } from '@reach/dialog'
import '@reach/dialog/styles.css'
import { useWeb3React, UnsupportedChainIdError } from '@web3-react/core'
import { URI_AVAILABLE } from '@web3-react/walletconnect-connector'

import { walletExists } from '../../services/ethers'
import wallets from '../../connectors/wallets'
import { walletconnect } from '../../connectors'

import QRCode from './QRCode'
import Divider from '../Divider'

const Modal = ({ children, showModal, closeModal }) => {
  const { account, activate } = useWeb3React()

  // TODO: Error state in the UI
  const [walletError, setWalletError] = useState(false)
  const [selectedWallet, setSelectedWallet] = useState(null)
  const [showWalletsView, setShowWalletsView] = useState(true)
  const [showAccountView, setShowAccountView] = useState(false)
  const [showPendingView, setShowPendingView] = useState(false)
  const [uri, setUri] = useState('')
  const [isWalletEnabled, setIsWalletEnabled] = useState(false)

  // TODO: reset the view to the main wallet selection view

  // set up uri listener for walletconnect
  useEffect(() => {
    if (walletExists()) {
      setIsWalletEnabled(true)
    }
    const activateWalletConnect = uri => {
      setUri(uri)
    }
    walletconnect.on(URI_AVAILABLE, activateWalletConnect)
    return () => {
      walletconnect.off(URI_AVAILABLE, activateWalletConnect)
    }
  }, [])

  const handleWalletActivation = async wallet => {
    setSelectedWallet(wallet)
    if (wallet.name === 'MetaMask') {
      if (await walletExists()) {
        if (account) {
          setShowWalletsView(false)
          setShowAccountView(true)
          return
        }
      } else {
        return window.open('https://metamask.io/', '_blank')
      }
    }
    if (wallet.name !== 'MetaMask') {
      setShowPendingView(true)
      setShowWalletsView(false)
    }
    activate(wallet.connector, undefined, true)
      .catch(error => {
        if (error instanceof UnsupportedChainIdError) {
          activate(wallet.connector)
        } else {
          console.error(`Error activating the wallet ${wallet.name}: `, error)
          setWalletError(true)
        }
      })
      .then(async () => {
        setShowWalletsView(false)
        setShowAccountView(true)
      })
  }

  const handleGoBack = () => {
    setShowPendingView(false)
    setShowWalletsView(true)
  }

  return (
    <Box>
      {children}
      <Dialog
        isOpen={showModal}
        onDismiss={closeModal}
        aria-label="Connect to a wallet dialog"
        sx={{
          position: 'relative',
          maxWidth: ['350px', '500', '660px'],
          width: '100%',
          padding: [3, 8],
          boxShadow:
            '0 4px 24px 0 rgba(149,152,171,0.16), 0 12px 48px 0 rgba(30,37,44,0.32)',
        }}
      >
        {showPendingView && !showWalletsView && (
          <img
            src="/arrow.svg"
            alt="arrow"
            onClick={handleGoBack}
            sx={{
              position: 'absolute',
              left: 5,
              top: 5,
              fill: '#bebebe',
              cursor: 'pointer',
              transform: 'rotate(180deg)',
            }}
          />
        )}
        <img
          src="/close.svg"
          alt="close"
          onClick={closeModal}
          sx={{
            position: 'absolute',
            right: 5,
            top: 5,
            fill: '#bebebe',
            cursor: 'pointer',
          }}
        />
        {!showWalletsView ? (
          account && showAccountView ? (
            <Grid>
              <Styled.p>You are logged in with {selectedWallet.name}</Styled.p>
              <Styled.p>{account}</Styled.p>
            </Grid>
          ) : (
            <QRCode size={240} uri={uri} />
          )
        ) : (
          <Fragment>
            <Box sx={{ textAlign: ['center', 'left'], mt: [5, 0] }}>
              <Styled.h2>Sign in</Styled.h2>
              <p sx={{ variant: 'text.large' }}>Connect to a Wallet</p>
            </Box>
            <Divider mt={6} mb={6} />
            {Object.keys(wallets).map(key => {
              const wallet = wallets[key]
              return (
                <Grid
                  key={wallet.name}
                  columns={2}
                  gap={2}
                  sx={gridStyles}
                  onClick={e => {
                    handleWalletActivation(wallet)
                  }}
                >
                  <Box>
                    <img
                      src={`/${wallet.icon}`}
                      sx={iconStyles}
                      alt="Wallet icon"
                    />
                  </Box>
                  <Box>
                    <Styled.h5 sx={{ color: 'secondary' }}>
                      {!isWalletEnabled && wallet.name === 'MetaMask'
                        ? 'Install MetaMask '
                        : wallet.name}
                      <img
                        src="/arrow.svg"
                        alt="arrow"
                        sx={{ ml: 1, fill: 'secondary' }}
                      />
                    </Styled.h5>
                    <p sx={{ variant: 'text.small' }}>{wallet.description}</p>
                  </Box>
                </Grid>
              )
            })}
          </Fragment>
        )}
      </Dialog>
    </Box>
  )
}

const gridStyles = {
  gridTemplateColumns: 'min-content 1fr',
  alignItems: 'center',
  padding: '16px',
  mt: 4,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '& img': {
    transition: 'all 0.2s ease',
  },
  '&:hover': {
    transition: 'all 0.3s ease',
    h5: {
      transition: 'all 0.3s ease',
      color: 'linkHover',
    },
    '& img[alt="arrow"]': {
      transition: 'all 0.2s ease',
      fill: 'linkHover',
      marginLeft: 3,
    },
  },
}

const iconStyles = {
  height: '44px',
  width: '44px',
  objectFit: 'contain',
  mr: 3,
}

Modal.propTypes = {
  children: PropTypes.any,
  showModal: PropTypes.bool,
  closeModal: PropTypes.func,
}

export default Modal
