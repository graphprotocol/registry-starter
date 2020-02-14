/** @jsx jsx */
import PropTypes from 'prop-types'
import { useState, useEffect, Fragment } from 'react'
import { jsx, Styled, Box } from 'theme-ui'
import { Grid } from '@theme-ui/components'
import { navigate } from 'gatsby'
import { isMobile } from 'react-device-detect'

import { useAccount } from '../../hooks'
import { metamaskAccountChange } from '../../services/ethers'
import { FILTERS, ORDER_BY, ORDER_DIRECTION } from '../../utils/constants'

import Link from '../Link'
import SignupModal from '../../components/Modal'
import Menu from '../../components/Select/Menu'
import Filters from '../../components/Filters'

const Navigation = ({
  children,
  setFilter,
  setOrderBy,
  setOrderDirection,
  location,
  ...props
}) => {
  const [showModal, setShowModal] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState(FILTERS['All Tokens'])
  const [selectedOrderBy, setSelectedOrderBy] = useState(ORDER_BY['Date added'])
  const [selectedOrderDirection, setSelectedOrderDirection] = useState(
    ORDER_DIRECTION.DESC
  )
  const [filterOpen, setFilterOpen] = useState(false)
  const [orderOpen, setOrderOpen] = useState(false)
  const { account, setAccount } = useAccount()

  useEffect(() => {
    // Listen for changing MM accounts
    metamaskAccountChange(accounts => setAccount(accounts[0]))
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
    <Fragment>
      <Grid
        sx={{
          gridTemplateColumns: '1fr max-content',
          justifyContent: 'space-between',
          height: ['80px', '128px'],
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
            <Link to={'/'} sx={{ fontSize: ['1.125rem', '1.5rem'] }}>
              Tokens
            </Link>
          </Styled.h4>
          {props.path === '/' && !isMobile && (
            <Filters
              filterItems={filterItems}
              orderItems={orderItems}
              filterOpen={filterOpen}
              setFilterOpen={setFilterOpen}
              selectedFilter={selectedFilter}
              orderOpen={orderOpen}
              setOrderOpen={setOrderOpen}
            />
          )}
        </Grid>
        {!isMobile && (
          <Grid
            columns={account ? [2, 3] : 2}
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
              {account ? (
                <img
                  src="/plus.png"
                  alt="plus"
                  sx={{ height: '18px', width: 'auto' }}
                />
              ) : (
                <span>Add a token</span>
              )}
            </Link>
            {account ? (
              <Fragment>
                <Link to={`/profile/${account}`} sx={{ textAlign: 'right' }}>
                  <img
                    src="/user.png"
                    alt="User"
                    sx={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      verticalAlign: 'middle',
                      mx: [0, 1],
                    }}
                  />
                </Link>
                <Menu
                  menuStyles={{ top: '25px', right: '-10px' }}
                  items={[
                    {
                      text: 'Your Tokens',
                      handleSelect: () => navigate(`/profile/${account}`),
                      icon: '/user.png',
                    },
                    {
                      text: (
                        <Fragment>
                          <Box
                            onClick={e => {
                              e.preventDefault()
                              setShowModal(true)
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
                        window.open(`https://3box.io/${account}`, '_blank'),
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
                <Link onClick={() => setShowModal(true)}>Sign In </Link>
              </Box>
            )}
          </Grid>
        )}
        {showModal && (
          <SignupModal
            showModal={showModal}
            closeModal={() => setShowModal(false)}
          />
        )}
      </Grid>
      {props.path === '/' && isMobile && (
        <Filters
          filterItems={filterItems}
          orderItems={orderItems}
          filterOpen={filterOpen}
          setFilterOpen={setFilterOpen}
          selectedFilter={selectedFilter}
          orderOpen={orderOpen}
          setOrderOpen={setOrderOpen}
        />
      )}
    </Fragment>
  )
}

Navigation.propTypes = {
  setFilter: PropTypes.func,
  setOrderBy: PropTypes.func,
  setOrderDirection: PropTypes.func,
  location: PropTypes.any,
}

export default Navigation
