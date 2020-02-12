/** @jsx jsx */
import PropTypes from 'prop-types'
import { Styled, jsx, Box } from 'theme-ui'
import { Dialog as ReachDialog } from '@reach/dialog'
import '@reach/dialog/styles.css'

const Dialog = ({
  children,
  title,
  description,
  showDialog,
  closeDialog,
  showMask,
}) => {
  return (
    <ReachDialog
      isOpen={showDialog}
      onDismiss={closeDialog}
      aria-label="Actions modal"
      sx={{
        position: 'relative',
        zIndex: 10,
        maxWidth: ['350px', '500', '660px'],
        width: '100%',
        py: [5, 7],
        px: [4, 8],
        boxShadow: '0 4px 24px 0 rgba(30,37,44,0.16)',
      }}
    >
      {showMask && (
        <Box
          sx={{
            position: 'absolute',
            zIndex: 0,
            width: '100%',
            height: '100%',
            top: 0,
            left: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.23)',
          }}
        />
      )}
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
  showDialog: PropTypes.bool,
  showMask: PropTypes.bool,
  closeDialog: PropTypes.func,
}

export default Dialog
