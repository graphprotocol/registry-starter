/** @jsx jsx */
import { Fragment } from 'react'
import { jsx, Box } from 'theme-ui'
import { Helmet } from 'react-helmet'
import emotionReset from 'emotion-reset'
import { Global, css } from '@emotion/core'
import { isMobile } from 'react-device-detect'

import Footer from '../Footer'
import Navigation from '../Navigation'

const LayoutTemplate = ({ children, mainStyles, ...props }) => {
  const styles = {
    maxWidth: '1246px',
    mx: 'auto',
    px: [4, 6, 7, 7],
    boxSizing: 'content-box',
    position: 'relative',
  }

  const isTokenPage =
    (props.path && props.path.match(/^\/token\//)) ||
    (props.path && props.path.match(/^\/edit\//))
  let border = isTokenPage
    ? isMobile
      ? '5px solid #6F4CFF'
      : '10px solid #6F4CFF'
    : '0px solid white'

  let height = isTokenPage ? '100vh' : '100%'

  return (
    <Fragment>
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
            border: ${border};
            transition: all 0.3s ease;
            height: ${height};
          },
        `}
      />
      <Box {...props} sx={styles}>
        <Helmet>
          <meta charSet="utf-8" />
          <title>Curation Starter dApp</title>
        </Helmet>
        <Navigation />
        <Box
          sx={{
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
        <Footer />
      </Box>
    </Fragment>
  )
}

export default LayoutTemplate
