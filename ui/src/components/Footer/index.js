/** @jsx jsx */
import { jsx, Box } from 'theme-ui'
import { Grid } from '@theme-ui/components'

const Footer = ({ ...props }) => {
  return (
    <Grid sx={rootStyles} {...props}>
      <Box sx={{ textAlign: ['center', 'left', 'left'] }}>
        <a
          href="https://github.com/graphprotocol/curation-starter"
          target="_blank"
          rel="noopener noreferrer"
          sx={{ display: 'inline-block', textDecoration: 'none' }}
        >
          <p sx={{ variant: 'text.smaller', lineHeight: '0.75rem' }}>
            <img
              src="/github.png"
              alt="Github"
              title="Github"
              sx={{
                height: '16px',
                width: '16px',
                marginRight: '4px',
                verticalAlign: 'bottom',
              }}
            />
            Github
          </p>
        </a>
      </Box>
      <Grid
        sx={{
          textAlign: 'right',
          maxWidth: '100px',
          justifySelf: ['center', 'flex-end', 'flex-end'],
        }}
        columns={3}
      >
        <img
          src="/graph.png"
          alt="The Graph"
          title="The Graph"
          sx={imageStyles}
        />
        <img src="/ipfs.png" alt="IPFS" title="IPFS" sx={imageStyles} />
        <img src="/eth.png" alt="Ethereum" title="Ethereum" sx={imageStyles} />
      </Grid>
    </Grid>
  )
}

const rootStyles = {
  display: 'grid',
  gridColumnGap: '20px',
  justifyContent: ['center', 'space-between', 'space-between'],
  gridTemplateColumns: ['1fr', '1fr 1fr', '1fr 1fr', '1fr 1fr'],
  alignItems: 'center',
  height: '96px',
  my: [4, 0, 0, 0],
}

const imageStyles = {
  height: '30px',
  width: '26px',
}

export default Footer
