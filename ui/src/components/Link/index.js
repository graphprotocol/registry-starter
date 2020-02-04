/** @jsx jsx */
import PropTypes from 'prop-types'
import { Link as GatsbyLink } from 'gatsby'
import { jsx } from 'theme-ui'

const Link = ({ to, children, ...props }) => {
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
}

Link.propTypes = {
  to: PropTypes.string,
  children: PropTypes.any,
}

export default Link
