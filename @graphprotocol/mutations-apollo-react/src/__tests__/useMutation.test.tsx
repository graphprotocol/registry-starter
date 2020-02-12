import React, { useEffect } from 'react'
import Enzyme, { mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import { act } from 'react-dom/test-utils'
import { isEqual } from 'lodash'

import {
  TEST_RESOLVER,
  client,
  statesToPublish
} from './utils'
import { useMutation } from '../'
import { MutationStates } from '@graphprotocol/mutations/dist/mutationState'
import { CoreState } from '@graphprotocol/mutations'

Enzyme.configure({ adapter: new Adapter() })

describe('UseMutation', () => {

   it('Correctly sets observer object inside context', async () => {
    let mutationFunction: Function
    let observerSet = false

    function Wrapper() {
      const [execute, { data }] = useMutation(TEST_RESOLVER, {
        client
      })

      if (data && data.testResolve) {
        observerSet = true
      }

      mutationFunction = execute
      return null
    }

    mount(<Wrapper/>)

    await act(async () => {
      mutationFunction()
    })

    expect(observerSet).toEqual(true)
  })

  it('Returns states in dispatch order', async () => {

    let mutationFunction: Function
    let states: MutationStates<CoreState>[] = []

    function Wrapper() {
      const [execute, { state }] = useMutation(TEST_RESOLVER, {
        client
      })

      mutationFunction = execute

      useEffect(() => {
        if(!isEqual(state, {}))
          states.push(state)
      }, [state])

      return null
    }

    mount(<Wrapper/>)

    await act(async () => {
      mutationFunction()
    })

    expect(states).toEqual(statesToPublish)
  })
})
