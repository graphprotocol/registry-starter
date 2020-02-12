import {
  MutationComponentOptionsWithState,
  MutationTupleWithState
} from './types'
import {
  CoreEvents,
  CoreState,
  EventTypeMap,
  MutationStates,
  MutationStatesSub
} from '@graphprotocol/mutations/dist/mutationState'

import {
  useEffect,
  useState
} from 'react'
import {
  useMutation as apolloUseMutation,
  MutationHookOptions
} from '@apollo/react-hooks'
import { OperationVariables } from '@apollo/react-common'
import { DocumentNode } from 'graphql'

export const useMutation = <
  TState = CoreState,
  TEventMap extends EventTypeMap = CoreEvents,
  TData = any,
  TVariables = OperationVariables
>(
  mutation: DocumentNode,
  options?: MutationHookOptions<TData, TVariables>
): MutationTupleWithState<TState, TEventMap, TData, TVariables> => {

  const [state, setState] = useState({} as MutationStates<TState, TEventMap>)
  const [observable] = useState(new MutationStatesSub<TState, TEventMap>({ }))

  const graphContext = {
    _rootSub: observable
  }

  const updatedOptions = options ? {
    ...options,
    context: {
      ...options.context,
      client: options.client,
      ...graphContext
    }
  } : {
    context: {
      ...graphContext
    }
  }

  const [execute, result] = apolloUseMutation(
    mutation, updatedOptions
  )

  useEffect(() => {
    let subscription = observable.subscribe((result: MutationStates<TState, TEventMap>) => {
      if (result) {
        setState(result)
      }
    })
    return () => subscription.unsubscribe()
  }, [observable, setState])

  return [
    execute,
    {
      ...result,
      state
    }
  ]
}

export const Mutation = <
  TState = CoreState,
  TEventMap extends EventTypeMap = CoreEvents,
  TData = any,
  TVariables = OperationVariables
>(
  props: MutationComponentOptionsWithState<TState, TEventMap, TData, TVariables>
) => {
  const [runMutation, result] = useMutation<TState, TEventMap>(props.mutation, props)
  return props.children ? props.children(runMutation, result) : null
}
