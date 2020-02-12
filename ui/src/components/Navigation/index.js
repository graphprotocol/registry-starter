/** @jsx jsx */
import PropTypes from 'prop-types'
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
import { FILTERS, ORDER_BY, ORDER_DIRECTION } from '../../utils/constants'

const Navigation = ({
  children,
  setFilter,
  setOrderBy,
  setOrderDirection,
  location,
  ...props
}) => {
  const { account } = useWeb3React()
  const [showModal, setShowModal] = useState(false)
  const [userAccount, setUserAccount] = useState(account)
  const [selectedFilter, setSelectedFilter] = useState(FILTERS['All Tokens'])
  const [selectedOrderBy, setSelectedOrderBy] = useState(ORDER_BY['Date added'])
  const [selectedOrderDirection, setSelectedOrderDirection] = useState(
    ORDER_DIRECTION.DESC
  )
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

  const filterItems = Object.keys(FILTERS).map(filter => {
    return {
      text:
        selectedFilter === FILTERS[filter] ? (
          <div>
            <img src="/dot.svg" sx={{ ml: -4, pr: 2 }} alt="dot" />
            {filter}
          </div>
        ) : (
          filter
        ),
      handleSelect: () => {
        setSelectedFilter(FILTERS[filter])
        setFilter(FILTERS[filter])
      },
    }
  })

  const orderItems = Object.keys(ORDER_BY).map(order => {
    return {
      text: (
        <Box>
          {selectedOrderBy === ORDER_BY[order] && (
            <img src="/dot.svg" sx={{ ml: -4, pr: 2 }} alt="dot" />
          )}
          {order}
          {selectedOrderBy === ORDER_BY[order] && (
            <p
              sx={{
                variant: 'text.small',
                display: 'inline',
                color: 'blackFaded',
                fontWeight: 'body',
                ml: 2,
              }}
            >
              {ORDER_BY[order] === 'symbol' ? 'a-z' : 'Recent'}
              <img
                src="/arrow-down.png"
                sx={{
                  width: '8px',
                  height: 'auto',
                  ml: 1,
                  transform:
                    selectedOrderDirection === ORDER_DIRECTION.ASC
                      ? 'rotate(180deg)'
                      : 'none',
                }}
                alt="arrow-down"
              />
            </p>
          )}
        </Box>
      ),
      handleSelect: () => {
        if (selectedOrderBy === ORDER_BY[order]) {
          const orderDirection =
            selectedOrderDirection === ORDER_DIRECTION.DESC
              ? ORDER_DIRECTION.ASC
              : ORDER_DIRECTION.DESC
          setSelectedOrderDirection(orderDirection)
          setOrderDirection(orderDirection)
        } else {
          setSelectedOrderDirection(ORDER_DIRECTION.DESC)
          setOrderDirection(ORDER_DIRECTION.DESC)
          setSelectedOrderBy(ORDER_BY[order])
        }
      },
      delay: 500,
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
              items={filterItems}
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
              items={orderItems}
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
            <Link to={`/profile/${userAccount}`} sx={{ textAlign: 'right' }}>
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

Navigation.propTypes = {
  setFilter: PropTypes.func,
  setOrderBy: PropTypes.func,
  setOrderDirection: PropTypes.func,
  location: PropTypes.any,
}

export default Navigation
