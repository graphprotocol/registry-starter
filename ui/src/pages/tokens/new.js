/** @jsx jsx */
import { useState, useEffect } from 'react'
import { Styled, jsx, Box } from 'theme-ui'
import { Grid } from '@theme-ui/components'

import TokenForm from '../../components/TokenForm'

const NewToken = ({ ...props }) => {
  const [isDisabled, setIsDisabled] = useState(true)
  const [token, setToken] = useState({
    symbol: '',
    description: '',
    address: '',
    decimals: '',
    imageName: '',
    imageUrl: '',
  })

  const setValue = (field, value) => {
    if (field === 'image') {
      return setToken(state => ({
        ...state,
        imageUrl: value.url,
        imageName: value.name,
      }))
    }

    setToken(state => ({
      ...state,
      [field]: value,
    }))
  }

  useEffect(() => {
    setIsDisabled(
      !(
        token.symbol.length > 0 &&
        token.description.length > 0 &&
        token.decimals.length > 0
      )
    )
  }, [token])

  const handleSubmit = () => {
    //TODO: handle submit logic here
    console.log('Submitted')
  }

  return (
    <Grid>
      <Box sx={{ maxWidth: '504px', width: '100%', my: 7 }}>
        <Styled.h1>Add a Token</Styled.h1>
        <Styled.p sx={{ mt: 2, mb: 6 }}>
          Add a token to the Ethereum Tokens Registry. Make sure the token is
          live on mainnet and all information about the token is accurate, to
          mitigate risk of the token being challenged.
        </Styled.p>
        <TokenForm
          token={token}
          setValue={setValue}
          handleSubmit={handleSubmit}
          isDisabled={isDisabled}
          isNew={true}
        />
      </Box>
    </Grid>
  )
}

export default NewToken
