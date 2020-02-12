/** @jsx jsx */
import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { jsx, Box } from 'theme-ui'
import { Grid } from '@theme-ui/components'

const Menu = ({
  children,
  items,
  top,
  right,
  setOpen,
  menuStyles,
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
  }, [])

  return (
    <Grid sx={{ position: 'relative' }} {...props}>
      <Box
        onClick={e => {
          e.stopPropagation()
          setIsOpen(!isOpen)
          setOpen && setOpen(!isOpen)
        }}
      >
        {children}
      </Box>
      {isOpen && (
        <Box sx={{ ...listStyles, ...menuStyles }}>
          {items &&
            items.map((item, index) => (
              <Box
                sx={{ ...linkStyles, display: item.icon ? 'grid' : 'block' }}
                onClick={e => {
                  e.stopPropagation()
                  item.handleSelect && item.handleSelect(e)
                  if (item.delay) {
                    setTimeout(() => {
                      setIsOpen(false)
                      setOpen && setOpen(false)
                    }, item.delay)
                  } else {
                    setIsOpen(false)
                    setOpen && setOpen(false)
                  }
                }}
                key={index}
              >
                {item.icon && (
                  <img
                    src={item.icon}
                    alt={`${item.text} icon`}
                    sx={iconStyles}
                  />
                )}
                {item.text}
              </Box>
            ))}
        </Box>
      )}
    </Grid>
  )
}

const listStyles = {
  width: 'max-content',
  position: 'absolute',
  zIndex: 10,
  boxShadow: '0 20px 64px 0 rgba(12,10,29,0.32)',
  bg: 'white',
  border: 'none',
  textAlign: 'center',
  cursor: 'pointer',
  px: 7,
  py: 3,
}

const linkStyles = {
  display: 'block',
  fontFamily: 'body',
  color: 'secondary',
  fontSize: '1rem',
  fontWeight: 'bold',
  letterSpacing: '0.31px',
  lineHeight: '2.375rem',
  gridTemplateColumns: '24px max-content',
  alignItems: 'center',
  justifyContent: 'left',
  gap: 3,
  textAlign: 'left',
  my: 3,
}

const iconStyles = {
  width: '24px',
  height: '24px',
  verticalAlign: 'middle',
  objectFit: 'contain',
  marginRight: 4,
}

Menu.propTypes = {
  children: PropTypes.any,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.any,
      handleSelect: PropTypes.func,
      icon: PropTypes.string,
      delay: PropTypes.number,
    })
  ),
}

export default Menu
