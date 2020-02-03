/** @jsx jsx */
import { jsx, Box } from 'theme-ui'
import { Fragment } from 'react'
import { Helmet } from 'react-helmet'

// import Footer from "../Footer"
import Navigation from '../Navigation'

const LayoutTemplate = ({ children, mainStyles, ...props }) => {
  const styles = {
    maxWidth: '1260px',
    mx: 'auto',
    px: [2, 4],
    boxSizing: 'content-box',
    position: 'relative',
  }

  return (
    <Box {...props}>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Curation Starter dApp</title>
      </Helmet>
      <Navigation sx={styles} />
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
            ...styles,
            mt: [5, 5, 0],
            minHeight: 'calc(100vh - 400px)',
            position: 'static',
          }}
        >
          {children}
        </main>
      </Box>
    </Box>
  )
}

export default LayoutTemplate
