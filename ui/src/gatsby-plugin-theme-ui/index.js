export default {
  colors: {
    background: 'white',
    text: '#090610',
    secondary: '#6F4CFF',
    blackFaded: 'rgba(9,6,16,0.64)',
    linkHover: '#452DA8',
    grey: 'rgba(30,37,44,0.16)',
  },
  fontSizes: [
    '0.75rem',
    '0.875rem',
    '1rem',
    '1.125rem',
    '1.5rem',
    '2rem',
    '2.75rem',
    '3.375rem',
  ],
  fonts: {
    body: 'Lato, sans-serif',
    heading: 'Lato, sans-serif',
  },
  fontWeights: {
    body: 400,
    heading: 900,
  },
  space: [0, 4, 8, 12, 16, 24, 32, 48, 64],
  breakpoints: ['40em', '52em', '64em', '76em'],
  styles: {
    h1: {
      fontWeight: 'heading',
      fontFamily: 'heading',
      fontSize: 7,
      letterSpacing: '2px',
    },
    h2: {
      fontWeight: 'heading',
      fontFamily: 'heading',
      fontSize: 6,
    },
    h3: {
      fontWeight: 'heading',
      fontFamily: 'heading',
      fontSize: 5,
    },
    h4: {
      fontWeight: 'heading',
      fontFamily: 'heading',
      fontSize: 4,
    },
    h5: {
      fontWeight: 'heading',
      fontFamily: 'heading',
      fontSize: 3,
    },
    h6: {
      fontWeight: 'heading',
      fontFamily: 'heading',
      fontSize: 2,
      lineHeight: '1.5rem',
    },
    p: {
      fontSize: 2,
      fontFamily: 'body',
      fontWeight: 'body',
      lineHeight: '1.5rem',
    },
  },
  buttons: {
    primary: {
      color: 'white',
      bg: 'secondary',
      boxShadow:
        '0 8px 32px 0 rgba(76,102,255,0.48), 0 4px 16px 0 rgba(0,0,0,0.16)',
      fontFamily: 'body',
      fontSize: '1rem',
      fontWeight: 'heading',
      letterSpacing: '1px',
      lineHeight: '2.5rem',
      height: '48px',
      boxSizing: 'content-box',
      border: 'none',
      px: 6,
      width: 'fit-content',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      '&:focus': {
        outline: 'none',
      },
      '&:hover': {
        boxShadow:
          '0 4px 32px 0 rgba(76,102,255,0.24), 0 12px 56px 0 rgba(30,37,44,0.32)',
        transition: 'all 0.3s ease',
      },
    },
    secondary: {
      color: 'secondary',
      bg: 'white',
      border: 'none',
      fontFamily: 'body',
      fontSize: '1rem',
      fontWeight: 'heading',
      letterSpacing: '1px',
      lineHeight: '2.5rem',
      height: '48px',
      boxSizing: 'content-box',
      px: 6,
      width: 'fit-content',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      '&:focus': {
        outline: 'none',
      },
      '&:hover': {
        boxShadow:
          '0 4px 32px 0 rgba(76,102,255,0.24), 0 12px 56px 0 rgba(30,37,44,0.32)',
        transition: 'all 0.3s ease',
      },
    },
  },
  text: {
    large: {
      fontSize: 3,
      lineHeight: '1.75rem',
      letterSpacing: '-0.2px',
      color: 'text',
      fontFamily: 'body',
    },
    smaller: {
      fontSize: 0,
      lineHeight: '1rem',
      color: 'blackFaded',
      fontFamily: 'body',
    },
    small: {
      fontSize: 1,
      lineHeight: '1.25rem',
      letterSpacing: '-0.4px',
      color: 'text',
      fontFamily: 'body',
    },
  },
}
