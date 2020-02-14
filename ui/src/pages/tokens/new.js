/** @jsx jsx */
import { useState, useEffect } from 'react'
import { Styled, jsx, Box } from 'theme-ui'
import { Grid } from '@theme-ui/components'
import cloneDeep from 'lodash.clonedeep'
import { useMutation } from '@graphprotocol/mutations-apollo-react'

import { TOKENS_QUERY, ADD_TOKEN } from '../../apollo/queries'
import TokenForm from '../../components/TokenForm'

const NewToken = ({ ...props }) => {
  const [isDisabled, setIsDisabled] = useState(true)
  const [token, setToken] = useState({
    symbol: '',
    description: '',
    address: '',
    decimals: '',
    image: '',
  })
  const [addToken, { data, loading, error, state }] = useMutation(ADD_TOKEN, {
    refetchQueries: [
      {
        query: TOKENS_QUERY,
        variables: {},
      },
    ],
    optimisticResponse: {
      addToken: true,
    },
    // update: (proxy, result) => {
    //   const data = cloneDeep(
    //     proxy.readQuery(
    //       {
    //         query: TOKENS_QUERY,
    //         variables: {},
    //       },
    //       true
    //     )
    //   )

    // if (result.data && result.data.addToken) {
    //   console.log('RESULT.DATA ', result.data)
    //   console.log('DATA: ', data)
    //   // data.tokens.push(token)
    // }
    // proxy.writeQuery({
    //   query: TOKENS_QUERY,
    //   data,
    //   variables: {},
    // })
    // },
    onError: error => {
      console.error(error)
    },
  })

  console.log('ERROR: ', error)

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

  const handleSubmit = e => {
    e.preventDefault()
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
