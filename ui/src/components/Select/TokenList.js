/** @jsx jsx */
import PropTypes from 'prop-types'
import { useState } from 'react'
import { Styled, jsx, Box, Grid } from 'theme-ui'

import Field from '../Field'
import Button from '../Button'
import Check from '../../images/check.svg'

const TokenList = ({
  title,
  tokens,
  setIsOpen,
  setValue,
  isMultiselect,
  isPlaceholder,
  selected,
}) => {
  const [searchText, setSearchText] = useState('')

  let allTokens = tokens
  if (searchText.length > 0) {
    allTokens = tokens.filter(
      token => token.symbol.toLowerCase().indexOf(searchText.toLowerCase()) > -1
    )
  }

  return (
    <Box
      sx={{
        ...listStyles,
        boxShadow: isMultiselect ? 'none' : '0 4px 24px 0 rgba(30,37,44,0.16)',
        position: isMultiselect ? 'static' : 'absolute',
      }}
    >
      <p sx={{ variant: 'text.small', color: 'secondary' }}>{title}</p>
      <Grid
        sx={{
          gridTemplateColumns: '1fr max-content',
          alignItems: 'center',
          position: 'relative',
          mb: 3,
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
          sx={{ border: 'none', pt: 4, mb: 0 }}
        />
        <Button
          onClick={e => {
            e.preventDefault()
            if (isMultiselect) {
              if (selected === tokens) {
                setValue([])
              } else {
                setValue(tokens)
              }
            } else {
              setIsOpen(false)
              setSearchText('')
            }
          }}
          text={
            isMultiselect
              ? selected === tokens
                ? `Unselect all`
                : `Select all`
              : 'Select'
          }
          variant="primary"
          sx={{
            m: 0,
            px: 4,
            fontSize: '1rem',
            boxSizing: 'border-box',
          }}
          isDisabled={!isMultiselect && isPlaceholder}
        />
      </Grid>
      {allTokens.map(token => {
        const isMultiselected =
          isMultiselect && selected.find(sel => sel.symbol === token.symbol)
        return (
          <Grid
            key={token.id}
            onClick={e => {
              if (isMultiselect) {
                const sel = selected.find(sel => sel.symbol === token.symbol)
                if (sel) {
                  selected.find((sel, index) => {
                    if (sel.symbol === token.symbol) {
                      delete selected[index]
                    }
                    return null
                  })
                  setValue(selected.flat())
                } else {
                  setValue(selected.concat(token))
                }
              } else {
                setValue(token)
              }
            }}
            sx={{
              gridTemplateColumns: '50px 1fr 30px',
              alignItems: 'center',
              py: 3,
              px: 2,
              mb: 2,
              transition: 'all 0.3s ease',
              boxShadow:
                selected === token.symbol || isMultiselected
                  ? '0 4px 24px 0 rgba(30,37,44,0.16)'
                  : 'none',
            }}
          >
            <img
              src={token.image}
              alt="Token"
              sx={{
                height: '48px',
                width: '48px',
                objectFit: 'contain',
              }}
            />
            <Styled.p
              sx={{
                textTransform: 'capslock',
                fontWeight: 'heading',
              }}
            >
              {token.symbol}
            </Styled.p>
            <Grid
              sx={{
                justifyContent: 'center',
                alignItems: 'center',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                border: '2px solid rgba(111,76,255,0.32)',
                backgroundColor:
                  selected === token.symbol || isMultiselected
                    ? 'secondary'
                    : 'white',
              }}
            >
              {selected === token.symbol && (
                <Box
                  sx={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: 'white',
                  }}
                />
              )}
              {isMultiselected && <Check />}
            </Grid>
          </Grid>
        )
      })}
    </Box>
  )
}

const listStyles = {
  width: '580px',
  maxHeight: '300px',
  height: '100%',
  overflow: 'scroll',
  ml: -5,
  mt: -5,
  border: 'none',
  bg: 'white',
  zIndex: 10,
  cursor: 'pointer',
  px: 5,
  py: 5,
}

TokenList.propTypes = {
  title: PropTypes.string,
  text: PropTypes.string,
  tokens: PropTypes.any,
  selected: PropTypes.any,
  setValue: PropTypes.func,
}

export default TokenList
