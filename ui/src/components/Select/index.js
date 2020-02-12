/** @jsx jsx */
import PropTypes from 'prop-types'
import { useState, useEffect } from 'react'
import { jsx, Box, Grid } from 'theme-ui'

import TokenList from './TokenList'

const Select = ({
  title,
  text,
  tokens,
  selected,
  setValue,
  setOpen,
  isPlaceholder,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleClick = () => {
      setIsOpen(false)
      setOpen && setOpen(false)
    }
    window.addEventListener('click', handleClick)

    return () => {
      window.removeEventListener('click', handleClick)
    }
  }, [setOpen])

  return (
    <Grid {...props}>
      <p sx={{ variant: 'text.small', color: 'secondary' }}>{title}</p>
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
        onClick={e => {
          e.stopPropagation()
          setIsOpen(!isOpen)
          setOpen && setOpen(!isOpen)
        }}
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
      {isOpen && (
        <TokenList
          title={title}
          tokens={tokens}
          setIsOpen={setIsOpen}
          selected={selected}
          setValue={setValue}
          isPlaceholder={isPlaceholder}
        />
      )}
    </Grid>
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
