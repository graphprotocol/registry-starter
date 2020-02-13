/** @jsx jsx */
import { useState, createContext } from 'react'
import { jsx, Box } from 'theme-ui'
import { Helmet } from 'react-helmet'
import emotionReset from 'emotion-reset'
import { Global, css } from '@emotion/core'

import Footer from '../Footer'
import Navigation from '../Navigation'
import { FILTERS, ORDER_BY, ORDER_DIRECTION } from '../../utils/constants'

export const ReactContext = createContext()

const LayoutTemplate = ({ children, ...props }) => {
  const [filter, setFilter] = useState(FILTERS['All Tokens'])
  const [orderBy, setOrderBy] = useState(ORDER_BY['Date added'])
  const [orderDirection, setOrderDirection] = useState(ORDER_DIRECTION.DESC)

  const styles = {
    maxWidth: '1246px',
    mx: 'auto',
    px: [4, 6, 7, 7],
    boxSizing: 'content-box',
    position: 'relative',
  }

  return (
    <ReactContext.Provider
      value={{
        filter: filter,
        orderBy: orderBy,
        orderDirection: orderDirection,
      }}
    >
      <Global
        styles={css`
          ${emotionReset}
          *, *::after, *::before {
            box-sizing: border-box;
            -moz-osx-font-smoothing: grayscale;
            -webkit-font-smoothing: antialiased;
            font-smoothing: antialiased;
          }
          body {
            margin: 0;
            background-color: white;
            transition: all 0.3s ease;
          }
        `}
      />
      <Box {...props}>
        <Helmet>
          <meta charSet="utf-8" />
          <title>Curation Starter dApp</title>
        </Helmet>
        <Navigation
          setFilter={setFilter}
          setOrderBy={setOrderBy}
          setOrderDirection={setOrderDirection}
          sx={styles}
          {...props}
        />
        <Box
          sx={{
            ...styles,
            '@keyframes fadein': {
              from: { opacity: 0 },
              to: { opacity: 1 },
            },
            animation: 'fadein 0.5s',
          }}
        >
          <main
            sx={{
              mt: [3, 0, 0, 0],
              minHeight: 'calc(100vh - 230px)',
              position: 'static',
            }}
          >
            {children}
          </main>
        </Box>
        <Footer sx={styles} />
      </Box>
    </ReactContext.Provider>
  )
}

export default LayoutTemplate
