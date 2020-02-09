/** @jsx jsx */
import React from 'react'
import { Styled, jsx, Box } from 'theme-ui'
import { Grid } from '@theme-ui/components'

import Link from '../components/Link'

const faces = [...Array(9).keys()]

const NotFoundPage = () => (
  <Grid columns={[1, 1, 2]} gap={8} mt={8}>
    <Box>
      <Styled.h1
        sx={{
          fontSize: ['5rem', '6rem', '6rem', '8rem'],
          lineHeight: '9.625rem',
        }}
      >
        Ooooops
      </Styled.h1>
      <p sx={{ variant: 'text.huge', mt: 5 }}>
        We can’t seem to find the page you’re looking for.{' '}
      </p>
      <p sx={{ variant: 'text.large', mb: 4, mt: 5 }}>Why don’t you try to: </p>
      <Link sx={{ color: 'secondary' }} to="/">
        Search for a Token
        <img src="/arrow.svg" alt="arrow" sx={{ ml: 1, fill: 'secondary' }} />
      </Link>
    </Box>
    <Grid columns={3}>
      {faces.map(face => (
        <img
          src="/face.png"
          alt="Sad"
          sx={{ height: ['96px', '96px', '96px', '118px'], width: 'auto' }}
        />
      ))}
    </Grid>
  </Grid>
)

export default NotFoundPage
