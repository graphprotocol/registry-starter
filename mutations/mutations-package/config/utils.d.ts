import { ConfigGenerators, ConfigArguments, ConfigProperties } from './types';
export declare const createConfig: <TConfig extends ConfigGenerators>(args: ConfigArguments<TConfig>, generators: ConfigGenerators) => Promise<ConfigProperties<TConfig>>;
export declare const validateConfig: (args: any, generators: any) => void;
