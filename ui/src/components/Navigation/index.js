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
import Caret from '../../images/caret.svg'
import Arrows from '../../images/arrows.svg'

export const FILTERS = [
  {
    name: 'All',
    displayName: 'All Tokens',
  },
  {
    name: 'Challenged',
    displayName: 'Challenged Tokens',
  },
]

export default ({ children, setFilter, setOrder, location, ...props }) => {
  const { account } = useWeb3React()
  const [showModal, setShowModal] = useState(false)
  const [userAccount, setUserAccount] = useState(account)
  const [selectedFilter, setSelectedFilter] = useState(FILTERS[0].name)
  const [selectedOrder, setSelectedOrder] = useState('createdAt_DESC')
  const [filterOpen, setFilterOpen] = useState(false)
  const [orderOpen, setOrderOpen] = useState(false)
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

  const items = FILTERS.map(filter => {
    return {
      text:
        selectedFilter === filter.name ? (
          <div>
            <img src="/dot.svg" sx={{ ml: -4, pr: 2 }} alt="dot" />
            {filter.displayName}
          </div>
        ) : (
          filter.displayName
        ),
      handleSelect: () => {
        setSelectedFilter(filter.name)
        setFilter(filter.name)
      },
    }
  })

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
          gridTemplateColumns: 'repeat(4, max-content)',
          alignItems: 'center',
          position: 'relative',
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
        {props.path === '/' && (
          <Fragment>
            <Menu
              items={items}
              menuStyles={{ top: '48px', left: '8px' }}
              setOpen={setFilterOpen}
            >
              <p
                sx={{
                  variant: 'text.cta',
                  px: 3,
                  mx: 2,
                  borderLeft: '1px solid',
                  borderRight: '1px solid',
                  backgroundColor: filterOpen ? 'secondary' : 'transparent',
                  borderColor: filterOpen ? 'transparent' : 'whiteFadedMore',
                  cursor: 'pointer',
                  color: filterOpen ? 'white' : 'blackFaded',
                  py: filterOpen ? 2 : 0,
                  transition: 'background 0.2s ease',
                }}
              >
                {selectedFilter}
                {filterOpen ? (
                  <Caret
                    sx={{
                      width: '16px',
                      height: 'auto',
                      ml: 2,
                      fill: 'white',
                      transform: 'rotate(180deg)',
                    }}
                  />
                ) : (
                  <Caret
                    sx={{
                      width: '16px',
                      height: 'auto',
                      ml: 2,
                      fill: 'blackFaded',
                    }}
                  />
                )}
              </p>
            </Menu>
            <Menu
              menuStyles={{ top: '50px', left: '-17px' }}
              setOpen={setOrderOpen}
              items={[
                {
                  text: (
                    <Box>
                      {(selectedOrder === 'createdAt_DESC' ||
                        selectedOrder === 'createdAt_ASC') && (
                        <img src="/dot.svg" sx={{ ml: -4, pr: 2 }} alt="dot" />
                      )}
                      Date added{' '}
                      <p
                        sx={{
                          variant: 'text.small',
                          display: 'inline',
                          color: 'blackFaded',
                          fontWeight: 'body',
                        }}
                      >
                        Recent
                        <img
                          src="/arrow-down.png"
                          sx={{
                            width: '8px',
                            height: 'auto',
                            ml: 1,
                            transform: selectedOrder.includes('ASC')
                              ? 'rotate(180deg)'
                              : 'none',
                          }}
                          alt="arrow-down"
                        />
                      </p>
                    </Box>
                  ),
                  handleSelect: () => {
                    if (selectedOrder === 'createdAt_DESC') {
                      setSelectedOrder('createdAt_ASC')
                      setOrder('createdAt_ASC')
                    } else {
                      setSelectedOrder('createdAt_DESC')
                      setOrder('createdAt_DESC')
                    }
                  },
                  delay: 500,
                },
                {
                  text: (
                    <Box>
                      {(selectedOrder === 'symbol_ASC' ||
                        selectedOrder === 'symbol_DESC') && (
                        <img src="/dot.svg" sx={{ ml: -4, pr: 2 }} alt="dot" />
                      )}
                      Name{' '}
                      <p
                        sx={{
                          variant: 'text.small',
                          display: 'inline',
                          color: 'blackFaded',
                          fontWeight: 'body',
                        }}
                      >
                        a-z
                        <img
                          src="/arrow-down.png"
                          sx={{
                            width: '8px',
                            height: 'auto',
                            ml: 1,
                            transform: selectedOrder.includes('ASC')
                              ? 'rotate(180deg)'
                              : 'none',
                          }}
                          alt="arrow-down"
                        />
                      </p>
                    </Box>
                  ),
                  handleSelect: () => {
                    if (selectedOrder === 'symbol_DESC') {
                      setSelectedOrder('symbol_ASC')
                      setOrder('symbol_ASC')
                    } else {
                      setSelectedOrder('symbol_DESC')
                      setOrder('symbol_DESC')
                    }
                  },
                  delay: 500,
                },
              ]}
            >
              <Box
                sx={{
                  width: '54px',
                  backgroundColor: orderOpen ? 'secondary' : 'transparent',
                  padding: 4,
                  marginLeft: '-17px',
                  transition: 'background 0.2s ease',
                }}
              >
                {orderOpen ? (
                  <Arrows
                    sx={{
                      width: '22px',
                      height: 'auto',
                      fill: 'white',
                      transform: 'rotate(180deg)',
                      cursor: 'pointer',
                    }}
                  />
                ) : (
                  <Arrows
                    sx={{
                      width: '22px',
                      height: 'auto',
                      fill: 'blackFaded',
                      cursor: 'pointer',
                    }}
                  />
                )}
              </Box>
            </Menu>
          </Fragment>
        )}
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
              menuStyles={{ top: '25px', right: '-10px' }}
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
