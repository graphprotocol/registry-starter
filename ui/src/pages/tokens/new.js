/** @jsx jsx */
import { useState, useEffect } from 'react'
import { Styled, jsx, Box } from 'theme-ui'
import { Grid } from '@theme-ui/components'
import { useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

import TokenForm from '../../components/TokenForm'

const ADD_TOKEN = gql`
  mutation addToken(
    $symbol: String!
    $description: String!
    $image: String
    $decimals: Int
  ) {
    addToken(
      symbol: $symbol
      description: $description
      image: $image
      decimals: $decimals
    ) {
      id
      symbol
      image
      description
      decimals
    }
  }
`

const NewToken = ({ ...props }) => {
  const [isDisabled, setIsDisabled] = useState(true)
  const [token, setToken] = useState({
    symbol: '',
    description: '',
    address: '',
    decimals: '',
    image: '',
  })
  const [addToken, { data, loading }] = useMutation(ADD_TOKEN)

  const setValue = (field, value) => {
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
    //TODO: Hook up migrations
    addToken({ variables: { ...token } })
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
          isLoading={loading}
        />
      </Box>
    </Grid>
  )
}

export default NewToken
