/** @jsx jsx */
import { useRef } from 'react'
import PropTypes from 'prop-types'
import { jsx, Box } from 'theme-ui'
import { Grid } from '@theme-ui/components'
import TextareaAutosize from 'react-textarea-autosize'

const Field = ({
  title,
  type,
  placeholder,
  charsCount,
  value,
  setValue,
  ...props
}) => {
  const charRef = useRef()

  // if (value && value.length === charsCount) {
  //   charRef.current.style = `opacity: 1; transition: all 0.3s ease;`
  //   setTimeout(() => {
  //     charRef.current.style = 'opacity: 0.4; transition: all 0.3s ease '
  //   }, 500)
  // }

  return (
    <Box
      {...props}
      sx={{
        ...styles.field,
        borderBottom: '1px solid',
        borderColor: 'whiteFaded',
      }}
    >
      {title && (
        <p sx={{ variant: 'text.small', color: 'secondary' }}>{title}</p>
      )}
      <Grid
        sx={{
          gridTemplateColumns: ['1fr', '1fr max-content', '1fr max-content'],
        }}
      >
        {type === 'input' ? (
          <input
            placeholder={placeholder}
            onChange={e => {
              e.stopPropagation()
              const value = e.target ? e.target.value : ''
              setValue(value)
            }}
            maxLength={charsCount}
            value={value}
          />
        ) : type === 'textarea' ? (
          <TextareaAutosize
            minRows={1}
            maxRows={6}
            style={{ padding: 0 }}
            placeholder={placeholder}
            onChange={e => {
              const value = e.target ? e.target.value : ''
              setValue(value)
            }}
            maxLength={charsCount}
            value={value}
          />
        ) : (
          <div />
        )}
        {charsCount && value && (
          <p
            sx={{
              variant: 'text.smaller',
              color: 'blackFaded',
              alignSelf: 'end',
            }}
            ref={charRef}
          >
            {value.length}/{charsCount}
          </p>
        )}
      </Grid>
    </Box>
  )
}

const styles = {
  field: {
    width: '100%',
    mb: '40px',
    pb: 2,
    transition: 'all 0.3s ease',
    '&>p': {
      variant: 'text.field',
      mb: 2,
    },
    '& input, & textarea': {
      width: '100%',
      background: 'none',
      border: 'none',
      outline: 'none',
      fontSize: '1.125rem',
      lineHeight: '1.75rem',
      letterSpacing: '-0.4',
      color: 'text',
      fontFamily: 'body',
      fontWeight: 'body',
      '&::placeholder': {
        color: 'blackFaded',
      },
    },
    '& textarea': {
      height: '80px',
      resize: 'none',
    },
    '&:hover': {
      transition: 'all 0.3s ease',
    },
  },
}

Field.propTypes = {
  title: PropTypes.string,
  type: PropTypes.string,
  charsCount: PropTypes.number,
  placeholder: PropTypes.string,
  value: PropTypes.string,
  setValue: PropTypes.func,
}

export default Field
