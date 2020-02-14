/** @jsx jsx */
import { useState, useEffect } from 'react'
import { Styled, jsx, Box } from 'theme-ui'
import { Grid } from '@theme-ui/components'
import { useQuery } from '@apollo/react-hooks'
import { useMutation } from '@apollo/react-hooks'

import { TOKEN_QUERY, EDIT_TOKEN } from '../../apollo/queries'
import TokenForm from '../../components/TokenForm'

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
  ] = useMutation(EDIT_TOKEN, {
    refetchQueries: [
      {
        query: TOKEN_QUERY,
        variables: {
          id: tokenId,
        },
      },
    ],
    optimisticResponse: {
      addToken: true,
    },
    update: (proxy, result) => {
      const data = cloneDeep(
        proxy.readQuery(
          {
            query: TOKEN_QUERY,
            variables: {},
          },
          true
        )
      )

      if (result.data && result.data.addToken) {
        console.log('RESULT.DATA ', result.data)
        // data.tokens.push(token)
      }
      proxy.writeQuery({
        query: TOKEN_QUERY,
        data,
        variables: {},
      })
    },
    onError: error => {
      console.error(error)
    },
  })

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
