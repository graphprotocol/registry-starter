/** @jsx jsx */
import PropTypes from 'prop-types'
import { jsx, Box, Styled } from 'theme-ui'
import { Grid } from '@theme-ui/components'

import Card from '../Card'

const Section = ({ title, subtitle, items }) => {
  return (
    <Grid my={6}>
      <Grid columns={[1, 2, 2]} my={1}>
        <Box>
          <Styled.h4>{title}</Styled.h4>
          <Styled.p sx={{ opacity: 0.64, color: 'rgba(9,6,16,0.5)' }}>
            <span>{subtitle}</span>
          </Styled.p>
        </Box>
      </Grid>
      <Grid columns={[2, 3, 4, 5, 6]} gap={[2, 2, 4, 6]}>
        {items.map(item => (
          <Card id={item.id} title={item.symbol} image={item.image} />
        ))}
      </Grid>
    </Grid>
  )
}

Section.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  items: PropTypes.any,
}

export default Section
