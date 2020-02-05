/** @jsx jsx */
import PropTypes from 'prop-types'
import { jsx, Box, Styled } from 'theme-ui'
import { navigate } from 'gatsby'

const Card = ({ id, title, image }) => {
  return (
    <Box
      key={id}
      sx={{
        height: ['160px', '180px', '180px'],
        width: ['160px', '180px', '180px'],
        border: '2px solid',
        borderColor: 'rgba(9,6,16,0.08)',
        backgroundColor: 'white',
        justifySelf: 'center',
        textAlign: 'center',
        paddingTop: '24px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover': {
          borderColor: 'secondary',
          transition: 'all 0.3s ease',
        },
      }}
      onClick={() => navigate(`/token/${id}`)}
    >
      <img
        src={image}
        sx={{
          width: '92px',
          height: '92px',
          display: 'block',
          padding: 3,
          boxSizing: 'border-box',
          margin: '0 auto',
          objectFit: 'contain',
        }}
        alt="Token"
      />
      <Styled.h5>{title}</Styled.h5>
    </Box>
  )
}

Card.propTypes = {
  id: PropTypes.string,
  title: PropTypes.string,
  image: PropTypes.string,
}

export default Card
