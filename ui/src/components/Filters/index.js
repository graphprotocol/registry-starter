/** @jsx jsx */
import PropTypes from 'prop-types'
import { jsx, Box } from 'theme-ui'
import { Grid } from '@theme-ui/components'

import Menu from '../../components/Select/Menu'
import Caret from '../../images/caret.svg'
import Arrows from '../../images/arrows.svg'

const Filters = ({
  filterItems,
  orderItems,
  filterOpen,
  setFilterOpen,
  selectedFilter,
  orderOpen,
  setOrderOpen,
}) => {
  return (
    <Grid
      sx={{
        gridTemplateColumns: 'repeat(2, max-content)',
        alignItems: 'center',
        position: 'relative',
      }}
    >
      <Menu
        items={filterItems}
        menuStyles={{ top: '48px', left: '8px' }}
        setOpen={setFilterOpen}
      >
        <p
          sx={{
            variant: 'text.cta',
            pr: 3,
            pl: [5, 3],
            mx: 2,
            borderLeft: ['none', '1px solid rgba(30,37,44,0.16)'],
            borderRight: '1px solid',
            backgroundColor: filterOpen ? 'secondary' : 'transparent',
            borderColor: filterOpen ? 'transparent' : 'whiteFadedMore',
            color: filterOpen ? 'white' : 'blackFaded',
            py: filterOpen ? 2 : 0,
            transition: 'background 0.2s ease',
            cursor: 'pointer',
          }}
        >
          {selectedFilter}
          {filterOpen ? (
            <Caret
              sx={{
                width: '16px',
                height: 'auto',
                ml: 2,
                fill: 'white',
                transform: 'rotate(180deg)',
              }}
            />
          ) : (
            <Caret
              sx={{
                width: '16px',
                height: 'auto',
                ml: 2,
                fill: 'blackFaded',
              }}
            />
          )}
        </p>
      </Menu>
      <Menu
        menuStyles={{ top: '50px', left: ['-22px', '-17px'] }}
        setOpen={setOrderOpen}
        items={orderItems}
      >
        <Box
          sx={{
            width: '54px',
            backgroundColor: orderOpen ? 'secondary' : 'transparent',
            padding: 4,
            marginLeft: ['-22px', '-17px'],
            transition: 'background 0.2s ease',
          }}
        >
          {orderOpen ? (
            <Arrows
              sx={{
                width: '22px',
                height: 'auto',
                fill: 'white',
                transform: 'rotate(180deg)',
                cursor: 'pointer',
              }}
            />
          ) : (
            <Arrows
              sx={{
                width: '22px',
                height: 'auto',
                fill: 'blackFaded',
                cursor: 'pointer',
              }}
            />
          )}
        </Box>
      </Menu>
    </Grid>
  )
}

Filters.propTypes = {
  filterItems: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.any,
      handleSelect: PropTypes.func,
      icon: PropTypes.string,
      delay: PropTypes.number,
    })
  ),
  orderItems: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.any,
      handleSelect: PropTypes.func,
      icon: PropTypes.string,
      delay: PropTypes.number,
    })
  ),
  filterOpen: PropTypes.bool,
  setFilterOpen: PropTypes.func,
  selectedFilter: PropTypes.string,
  orderOpen: PropTypes.bool,
  setOrderOpen: PropTypes.func,
}

export default Filters
