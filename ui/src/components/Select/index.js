/** @jsx jsx */
import PropTypes from 'prop-types'
import { useState, Fragment } from 'react'
import { Styled, jsx, Box, Grid } from 'theme-ui'
import {
  Menu,
  MenuList,
  MenuButton,
  MenuItem,
  MenuPopover,
} from '@reach/menu-button'
import '@reach/menu-button/styles.css'

import Field from '../Field'

// TODO: Create a custom select because when you type search letters
// it interferes with the dropdown selection
const Select = ({
  title,
  text,
  tokens,
  selected,
  setValue,
  isPlaceholder,
  ...props
}) => {
  const [searchText, setSearchText] = useState('')
  let allTokens = tokens
  if (searchText.length > 0) {
    allTokens = tokens.filter(
      token => token.symbol.toLowerCase().indexOf(searchText.toLowerCase()) > -1
    )
  }
  return (
    <Box {...props}>
      <p sx={{ variant: 'text.small', color: 'secondary' }}>{title}</p>
      <Menu>
        {({ isOpen }) => (
          <Fragment>
            <MenuButton
              sx={{
                WebkitAppearance: 'none',
                border: 'none',
                width: '100%',
                '&:focus': { outline: 'none' },
                cursor: 'pointer',
                background: 'inherit',
                p: 0,
              }}
            >
              <Grid
                sx={{
                  gridTemplateColumns: 'max-content 1fr',
                  alignItems: 'center',
                  pt: 2,
                  cursor: 'pointer',
                  borderBottom: '1px solid',
                  borderColor: 'whiteFaded',
                  pb: 2,
                }}
                gap={1}
              >
                <p
                  sx={{
                    variant: 'text.large',
                    color: isPlaceholder ? 'blackFaded' : 'text',
                  }}
                >
                  {selected}
                </p>
                <Box
                  sx={{
                    justifySelf: 'end',
                    height: '9px',
                    width: '9px',
                    borderTop: '1px solid',
                    borderRight: '1px solid',
                    borderColor: 'rgba(30,37,44,0.64)',
                    transform: isOpen ? 'rotate(-45deg)' : 'rotate(135deg)',
                  }}
                />
              </Grid>
            </MenuButton>
            <MenuPopover
              sx={{
                width: '532px',
                maxHeight: '220px',
                height: '100%',
                overflow: 'scroll',
                border: 'none',
                ml: '-10px',
                mt: '-12px',
                boxShadow: '0 4px 24px 0 rgba(30,37,44,0.16)',
                background: 'white',
                '&>[data-reach-menu-item]:focus': {
                  outline: 'none',
                },
                '&>[data-reach-menu-item][data-selected]': {
                  background: 'none',
                  color: 'secondary',
                },
              }}
            >
              <Field
                type="input"
                title=""
                placeholder="Search tokens"
                value={searchText}
                setValue={value => {
                  setSearchText(value)
                }}
                sx={{ border: 'none', px: 5, mb: 2 }}
              />
              {allTokens.map(token => (
                <MenuItem
                  key={token.id}
                  onSelect={() => setValue('token', token)}
                  sx={{
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transition: 'all 0.3s ease',
                      '& p': {
                        color: 'secondary',
                      },
                    },
                  }}
                >
                  <Grid
                    sx={{
                      gridTemplateColumns: '50px 1fr',
                      alignItems: 'center',
                    }}
                  >
                    <img
                      src={token.image}
                      alt="Token"
                      sx={{ height: '48px', width: 'auto' }}
                    />
                    <Styled.p
                      sx={{ textTransform: 'capslock', fontWeight: 'heading' }}
                    >
                      {token.symbol}
                    </Styled.p>
                  </Grid>
                </MenuItem>
              ))}
            </MenuPopover>
          </Fragment>
        )}
      </Menu>
    </Box>
  )
}

Select.propTypes = {
  title: PropTypes.string,
  text: PropTypes.string,
  tokens: PropTypes.any,
  selected: PropTypes.string,
  setValue: PropTypes.func,
  isPlaceholder: PropTypes.bool,
}

export default Select
