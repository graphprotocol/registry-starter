import { OptionalAsync } from '../utils'

type InferGeneratorArg<T> =
  T extends ((value: infer U) => any) ? U : ConfigArguments<T>

type InferGeneratorRet<T> =
  T extends ((value: any) => infer U) ? (
    U extends Promise<infer F> ? F : U
  ) : ConfigProperties<T>

// Validate that all leaf property values of the ConfigArguments
// instance match the type of the ConfigGenerators function arguments
type ConfigArgumentFunc<T> = () => OptionalAsync<InferGeneratorArg<T>>

type ConfigGenerator<TArg, TRet> = (value: TArg) => OptionalAsync<TRet>

export interface ConfigGenerators {
  [prop: string]: ConfigGenerator<any, any> | ConfigGenerators
}

export type ConfigProperty<T> = InferGeneratorRet<T>

export type ConfigProperties<T> = {
  [Prop in keyof T]: ConfigProperty<T[Prop]>
}

export type ConfigArgument<T> = InferGeneratorArg<T> | ConfigArgumentFunc<T>

export type ConfigArguments<T> = {
  [Prop in keyof T]: ConfigArgument<T[Prop]>
}
