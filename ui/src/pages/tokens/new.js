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
    if (
      token.symbol.length > 0 &&
      token.description.length > 0 &&
      token.decimals.length > 0
    ) {
      setIsDisabled(false)
    }
  }, [token])

  const handleSubmit = () => {
    //TODO: handle submit logic here
    console.log('Submitted')
  }

  return (
    <Grid>
      <Styled.h1>Add a Token</Styled.h1>
      <Styled.p>TODO: Need Copy</Styled.p>
      <Box sx={{ maxWidth: '504px', width: '100%', mt: 7 }}>
        <TokenForm
          token={token}
          setValue={setValue}
          handleSubmit={handleSubmit}
          isDisabled={isDisabled}
        />
      </Box>
    </Grid>
  )
}

export default NewToken
