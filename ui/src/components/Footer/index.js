/** @jsx jsx */
import { jsx, Styled } from 'theme-ui'
import { Grid } from '@theme-ui/components'
import { Link } from 'gatsby'
import Graph from '../../images/graph.png'
import Ipfs from '../../images/ipfs.png'
import Eth from '../../images/eth.png'
import Github from '../../images/github.png'

const Footer = ({ ...props }) => {
  return (
    <Grid sx={rootStyles} {...props}>
      <Styled.p sx={{ textAlign: ['center', 'left', 'left'] }}>
        <a
          href="https://github.com/graphprotocol/curation-starter"
          target="_blank"
          sx={{ display: 'inline-block', textDecoration: 'none' }}
        >
          <p sx={{ variant: 'text.smaller' }}>
            <img
              src={Github}
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
      </Styled.p>
      <Grid
        sx={{
          textAlign: 'right',
          maxWidth: '100px',
          justifySelf: ['center', 'flex-end', 'flex-end'],
        }}
        columns={3}
      >
        <img src={Graph} alt="The Graph" title="The Graph" sx={imageStyles} />
        <img src={Ipfs} alt="IPFS" title="IPFS" sx={imageStyles} />
        <img src={Eth} alt="Ethereum" title="Ethereum" sx={imageStyles} />
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
