/** @jsx jsx */
import { useState, useEffect } from 'react'
import { Styled, jsx, Box } from 'theme-ui'
import { Grid } from '@theme-ui/components'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

import TokenForm from '../../components/TokenForm'

const TOKEN_QUERY = gql`
  query token($id: ID!) {
    token(where: { id: $id }) {
      id
      symbol
      image
      description
      decimals
      address
    }
  }
`

const EditToken = ({ location, ...props }) => {
  const tokenId = location ? location.pathname.split('/')[2] : ''
  const { loading, error, data } = useQuery(TOKEN_QUERY, {
    variables: {
      id: tokenId,
    },
  })

  const [isDisabled, setIsDisabled] = useState(true)
  const [token, setToken] = useState({
    symbol: '',
    description: '',
    address: '',
    decimals: '',
    imageName: '',
    imageUrl: '',
  })

  useEffect(() => {
    if (data) {
      let tokenObj = data && data.token
      setToken(state => ({
        ...state,
        symbol: tokenObj ? tokenObj.symbol : '',
        description: tokenObj ? tokenObj.description : '',
        decimals: tokenObj ? tokenObj.decimals : '',
        imageName:
          tokenObj && tokenObj.image
            ? tokenObj.image
                .split('/')
                .slice(-1)
                .join('')
            : '',
        imageUrl: tokenObj ? tokenObj.image : '',
      }))
    }
  }, [data])

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
      <Styled.h1>Edit {token.symbol}</Styled.h1>
      <Styled.p>TODO: Need Copy</Styled.p>
      <Box sx={{ maxWidth: '504px', width: '100%', my: 7 }}>
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

export default EditToken
