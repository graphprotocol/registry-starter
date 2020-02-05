/** @jsx jsx */

import { jsx, Box } from 'theme-ui'
import React from 'react'
import { Helmet } from 'react-helmet'
import { Global } from '@emotion/core'

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

  return (
    <>
      <Global
        styles={theme => ({
          body: {
            margin: 0,
            backgroundColor: 'white',
          },
        })}
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
    </>
  )
}

export default LayoutTemplate
