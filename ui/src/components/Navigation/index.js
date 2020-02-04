/** @jsx jsx */
import { jsx, Styled } from 'theme-ui'
import { Grid } from '@theme-ui/components'
import Link from '../Link'
import Logo from '../../images/logo.svg'

export default ({ children, mainStyles, ...props }) => {
  return (
    <Grid
      sx={{
        gridTemplateColumns: '1fr max-content',
        justifyContent: 'space-between',
        height: '128px',
        alignItems: 'center',
      }}
      {...props}
    >
      <Grid
        sx={{
          gridTemplateColumns: 'max-content max-content',
          alignItems: 'center',
        }}
        gap={2}
      >
        <Link to={'/'}>
          <Logo
            sx={{ width: '24px', height: '24px', verticalAlign: 'middle' }}
          />
        </Link>
        <Styled.h4>
          <Link to={'/'}>Tokens</Link>
        </Styled.h4>
      </Grid>
      <Grid>Placeholder</Grid>
    </Grid>
  )
}
