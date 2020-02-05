/** @jsx jsx */
import PropTypes from 'prop-types'
import { Link as GatsbyLink } from 'gatsby'
import { jsx, Styled } from 'theme-ui'

const Link = ({ to, children, onClick, ...props }) => {
  if (to) {
    return (
      <GatsbyLink
        to={to}
        sx={{
          textDecoration: 'none',
          display: 'block',
          color: 'text',
          fontWeight: 'heading',
          '&:hover': {
            color: 'linkHover',
          },
        }}
        {...props}
        activeStyle={{}}
      >
        {children}
      </GatsbyLink>
    )
  } else if (onClick) {
    return (
      <Styled.p
        onClick={onClick}
        sx={{
          fontWeight: 'heading',
          color: 'secondary',
          cursor: 'pointer',
          '&:hover': {
            color: 'linkHover',
          },
        }}
      >
        {children}
      </Styled.p>
    )
  }
}

Link.propTypes = {
  to: PropTypes.string,
  children: PropTypes.any,
  onClick: PropTypes.func,
}

export default Link
