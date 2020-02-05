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
    return <Styled.p onClick={onClick}>{children}</Styled.p>
  }
}

Link.propTypes = {
  to: PropTypes.string,
  children: PropTypes.any,
}

export default Link
