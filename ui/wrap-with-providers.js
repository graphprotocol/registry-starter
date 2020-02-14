import React, { createContext } from 'react'
import { ethers } from 'ethers'
import { ApolloProvider } from '@apollo/react-hooks'
import { Web3ReactProvider } from '@web3-react/core'
import client from './src/apollo/client'
import Layout from './src/components/Layout'
import Web3ReactConnect from './src/components/Web3ReactConnect'
import { CustomToastContainer } from './src/components/Toast';

const getLibrary = provider => {
  const library = new ethers.providers.Web3Provider(provider)
  library.pollingInterval = 10000
  return library
}

export const ReactContext = createContext()

const wrapRootElement = ({ element }) => {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <ApolloProvider client={client}>
        <ReactContext.Provider>{element}</ReactContext.Provider>
      </ApolloProvider>
    </Web3ReactProvider>
  )
}

const wrapPageElement = ({ element, props }) => (
  <Layout {...props}>
    <CustomToastContainer />
    <Web3ReactConnect>{element}</Web3ReactConnect>
  </Layout>
)

export { wrapRootElement, wrapPageElement }
