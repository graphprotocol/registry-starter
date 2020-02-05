export default {
  colors: {
    background: 'white',
    text: '#090610',
    secondary: '#6F4CFF',
    blackFaded: 'rgba(9,6,16,0.64)',
    linkHover: '#452DA8',
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
    body: 'Lato',
    heading: 'Lato',
  },
  fontWeights: {
    body: 400,
    heading: 900,
  },
  space: [0, 4, 8, 12, 16, 24, 32, 48, 64],
  breakpoints: ['40em', '52em', '64em', '76em'],
  text: {
    heading: {
      fontFamily: 'heading',
    },
    body: {
      fontFamily: 'body',
    },
  },
  styles: {
    h1: {
      variant: 'text.heading',
      fontSize: 7,
      fontFamily: 'heading',
      margin: 0,
    },
    h2: {
      variant: 'text.heading',
      fontSize: 6,
      fontFamily: 'heading',
      margin: 0,
    },
    h3: {
      variant: 'text.heading',
      fontSize: 5,
      fontFamily: 'heading',
    },
    h4: {
      variant: 'text.heading',
      fontSize: 4,
      fontFamily: 'heading',
    },
    h5: {
      variant: 'text.heading',
      fontFamily: 'heading',
      fontSize: 3,
      margin: 0,
      lineHeight: '2rem',
    },
    h6: {
      variant: 'text.heading',
      fontFamily: 'heading',
      fontSize: 2,
      margin: 0,
      lineHeight: '1.5rem',
    },
    p: {
      variant: 'text.body',
      fontSize: 2,
      fontFamily: 'body',
      lineHeight: '1.5rem',
      margin: 0,
    },
  },
  text: {
    large: {
      fontSize: 3,
      lineHeight: '1.75rem',
      letterSpacing: '-0.2px',
      color: 'text',
      fontFamily: 'body',
      margin: 0,
    },
    smaller: {
      fontSize: 0,
      lineHeight: '1rem',
      color: 'blackFaded',
      fontFamily: 'body',
      margin: 0,
    },
    small: {
      fontSize: 1,
      lineHeight: '1.25rem',
      letterSpacing: '-0.4px',
      color: 'text',
      fontFamily: 'body',
      margin: 0,
    },
  },
}
