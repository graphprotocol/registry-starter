import {
  EventPayload,
  StateBuilder
} from './types'

type ProgressValue = 0|1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|18|19|20|
21|22|23|24|25|26|27|28|29|30|31|32|33|34|35|36|37|38|39|40|41|42|43|44|45|
46|47|48|49|50|51|52|53|54|55|56|57|58|59|60|61|62|63|64|65|66|67|68|69|70|
71|72|73|74|75|76|77|78|79|80|81|82|83|84|85|86|87|88|89|90|91|92|93|94|95|
96|97|98|99|100

export interface CoreState {
  uuid: string
  progress: ProgressValue
}

export type CoreEvents = {
  'TRANSACTION_CREATED': TransactionCreatedEvent
  'TRANSACTION_COMPLETED': TransactionCompletedEvent
  'TRANSACTION_ERROR': TransactionErrorEvent
  'PROGRESS_UPDATE': ProgressUpdateEvent
}

export interface TransactionCreatedEvent extends EventPayload {
  id: string
  to: string
  from: string
  data: string
  amount: string
  chainId: string
  description: string
}

export interface TransactionCompletedEvent extends EventPayload {
  id: string
  description: string
}

export interface TransactionErrorEvent extends EventPayload {
  id: string
  error: Error
}

export interface ProgressUpdateEvent extends EventPayload {
  value: ProgressValue
}

export const coreStateBuilder: StateBuilder<CoreState, CoreEvents> = {
  getInitialState(uuid: string): CoreState {
    return {
      progress: 0,
      uuid
    }
  },
  reducers: {
    'PROGRESS_UPDATE': async (state: CoreState, payload: ProgressUpdateEvent) => {
      if (payload.value < 0 || payload.value > 100 || ! Number.isInteger(payload.value)) {
        throw new Error('Progress value must be an integer between 0 and 100')
      }

      return {
        progress: payload.value
      }
    }
  }
}
