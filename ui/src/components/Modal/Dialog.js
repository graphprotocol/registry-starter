/** @jsx jsx */
import PropTypes from 'prop-types'
import { useState, Fragment, useEffect } from 'react'
import { Styled, jsx, Box } from 'theme-ui'
import { Grid } from '@theme-ui/components'
import { Dialog as ReachDialog } from '@reach/dialog'
import '@reach/dialog/styles.css'

const Dialog = ({ children, title, description, showDialog, closeDialog }) => {
  return (
    <ReachDialog
      isOpen={showDialog}
      onDismiss={closeDialog}
      aria-label="Actions modal"
      sx={{
        position: 'relative',
        maxWidth: ['350px', '500', '660px'],
        width: '100%',
        py: [5, 7],
        px: [4, 8],
        boxShadow: '0 4px 24px 0 rgba(30,37,44,0.16)',
      }}
    >
      <img
        src="/close.svg"
        alt="close"
        onClick={closeDialog}
        sx={{
          position: 'absolute',
          right: [1, 5],
          top: [1, 5],
          fill: '#bebebe',
          cursor: 'pointer',
        }}
      />
      <Box>
        <Styled.h2>{title}</Styled.h2>
        <p sx={{ variant: 'text.large', mt: 2, mb: 6 }}>{description}</p>
        {children}
      </Box>
    </ReachDialog>
  )
}

Dialog.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  children: PropTypes.any,
  showDialog: PropTypes.bool,
  closeDialog: PropTypes.func,
}

export default Dialog
