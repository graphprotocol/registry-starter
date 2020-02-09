import { OptionalAsync } from '../utils';
declare type InferGeneratorArg<T> = T extends ((value: infer U) => any) ? U : ConfigArguments<T>;
declare type InferGeneratorRet<T> = T extends ((value: any) => infer U) ? (U extends Promise<infer F> ? F : U) : ConfigProperties<T>;
declare type ConfigArgumentFunc<T> = () => OptionalAsync<InferGeneratorArg<T>>;
declare type ConfigGenerator<TArg, TRet> = (value: TArg) => OptionalAsync<TRet>;
export interface ConfigGenerators {
    [prop: string]: ConfigGenerator<any, any> | ConfigGenerators;
}
export declare type ConfigProperty<T> = InferGeneratorRet<T>;
export declare type ConfigProperties<T> = {
    [Prop in keyof T]: ConfigProperty<T[Prop]>;
};
export declare type ConfigArgument<T> = InferGeneratorArg<T> | ConfigArgumentFunc<T>;
export declare type ConfigArguments<T> = {
    [Prop in keyof T]: ConfigArgument<T[Prop]>;
};
export {};
