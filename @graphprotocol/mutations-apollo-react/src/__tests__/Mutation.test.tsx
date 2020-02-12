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
import { Mutation } from '../'
import { MutationStates } from '@graphprotocol/mutations/dist/mutationState'
import { CoreState } from '@graphprotocol/mutations'

Enzyme.configure({ adapter: new Adapter() })

describe('Mutation', () => {

  it('Correctly sets observer object inside context', async () => {
    let executeFunction: Function
    let observerSet = false

    function Wrapper() {
      return (
        <Mutation mutation={TEST_RESOLVER} client={client}>
          {
            (execute, { data }) => {
              executeFunction = execute
              if (data && data.testResolve) {
                observerSet = true
              }
              return null
            }
          }
        </Mutation>
      )
    }

    mount(<Wrapper/>)

    await act(async () => {
      executeFunction()
    })

    expect(observerSet).toEqual(true)
  })

  it('Returns states in dispatch order', async () => {
    let executeFunction: any
    let states: MutationStates<CoreState>[] = []

    function Wrapper() {
      return (
        <Mutation mutation={TEST_RESOLVER} client={client}>
          {
            (execute, { state }) => {
              executeFunction = execute

              useEffect(() => {
                if (!isEqual(state, {})) {
                  states.push(state)
                }
              }, [state])

              return null
            }
          }
        </Mutation>
      )
    }

    mount(<Wrapper/>)

    await act(async () => {
      executeFunction()
    })

    expect(states).toEqual(statesToPublish)
  })
})
