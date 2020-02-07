/** @jsx jsx */
import { jsx } from 'theme-ui'
import { Grid } from '@theme-ui/components'

const Divider = ({ ...props }) => <Grid sx={styles} {...props} />

const styles = {
  height: '2px',
  width: '100%',
  borderTop: '1px solid',
  borderColor: 'whiteFaded',
}

export default Divider
