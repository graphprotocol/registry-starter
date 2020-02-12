import { MutationStates, EventTypeMap } from '@graphprotocol/mutations/dist/mutationState'

import {
  BaseMutationOptions,
  ExecutionResult,
  MutationResult,
  MutationFunction,
  MutationFunctionOptions
} from '@apollo/react-common'
import { DocumentNode } from 'graphql'

interface MutationResultWithState<TState, TEventMap extends EventTypeMap, TData = any> extends MutationResult<TData> {
  state: MutationStates<TState, TEventMap>
}

export type MutationTupleWithState<
  TState,
  TEventMap extends EventTypeMap,
  TData,
  TVariables
> = [
  (
    options?: MutationFunctionOptions<TData, TVariables>
  ) => Promise<ExecutionResult<TData>>,
  MutationResultWithState<TState, TEventMap, TData>
]

export interface MutationComponentOptionsWithState<
  TState,
  TEventMap extends EventTypeMap,
  TData,
  TVariables
> extends BaseMutationOptions<TData, TVariables> {
  mutation: DocumentNode
  children: (
    mutateFunction: MutationFunction<TData, TVariables>,
    result: MutationResultWithState<TState, TEventMap, TData>
  ) => JSX.Element | null
}
