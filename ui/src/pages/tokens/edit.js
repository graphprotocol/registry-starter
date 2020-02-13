/** @jsx jsx */
import { useState, useEffect } from 'react'
import { Styled, jsx, Box } from 'theme-ui'
import { Grid } from '@theme-ui/components'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import { useMutation } from '@apollo/react-hooks'

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

const EDIT_TOKEN = gql`
  mutation editToken(
    $symbol: String!
    $description: String!
    $image: String
    $decimals: Int
  ) {
    editToken(
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

const EditToken = ({ location, ...props }) => {
  const tokenId = location ? location.pathname.split('/')[2] : ''
  const [isDisabled, setIsDisabled] = useState(true)
  const [token, setToken] = useState({
    symbol: '',
    description: '',
    address: '',
    decimals: '',
    image: '',
  })

  const { loading, error, data } = useQuery(TOKEN_QUERY, {
    variables: {
      id: tokenId,
    },
  })
  const [
    editToken,
    { data: mutationData, loading: mutationLoading },
  ] = useMutation(EDIT_TOKEN)

  useEffect(() => {
    if (data) {
      let tokenObj = data && data.token
      setToken(state => ({
        ...state,
        symbol: tokenObj ? tokenObj.symbol : '',
        description: tokenObj ? tokenObj.description : '',
        decimals: tokenObj ? tokenObj.decimals : '',
        image: '',
      }))
    }
  }, [data])

  const setValue = (field, value) => {
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
    editToken({ variables: { ...token } })
  }

  return (
    <Grid>
      <Styled.h1>Edit {token.symbol}</Styled.h1>
      <Styled.p>
        Edit data about a token on the Ethereum Tokens Registry. Make sure the
        token exists and all information is accurate to mitigate the risk of the
        token being challenged.
      </Styled.p>
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
