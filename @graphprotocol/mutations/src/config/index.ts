import {
  ConfigGenerators,
  ConfigArguments,
  ConfigProperties
} from './types'
import { execFunc } from '../utils'

const initConfig = async (
  properties: any,
  args: any,
  generators: any
) => {

  // An argument can be a function that returns other arguments
  if (typeof args === 'function') {
    args = await execFunc(args)
  }

  const keys = Object.keys(generators)

  for (let key of keys) {
    const generator = generators[key]

    if (typeof generator === 'function') {
      let arg = args[key]

      if (typeof arg === 'function') {
        arg = await execFunc(arg)
      }

      properties[key] = await execFunc(generator, arg)
    } else {
      properties[key] = { }
      await initConfig(properties[key], args[key], generators[key])
    }
  }
}

export const createConfig = async <TConfig extends ConfigGenerators>(
  args: ConfigArguments<TConfig>,
  generators: TConfig
): Promise<ConfigProperties<TConfig>> => {
  const config = { }
  await initConfig(config, args, generators)
  return config as ConfigProperties<TConfig>
}

export const validateConfig = (args: any, generators: any, depth = 0) => {
  const keys = Object.keys(generators)

  if (depth !== 0 && keys.length === 0) {
    throw Error('Config Generators must be a function, or an object that contains functions.')
  }

  keys.forEach(key => {
    if (args[key] === undefined) {
      throw Error(`Failed to find mutation configuration value for the property '${key}'.`)
    }

    const generator = generators[key]
    const generatorType = typeof generator

    if (generatorType === 'object') {
      if (typeof args[key] === 'function') {
        // we return here, as we can't validate at runtime that
        // the function will return the shape we're looking for
        return
      }
      validateConfig(args[key], generators[key], depth + 1)
    } else if (generatorType === 'function') {
      if (generator.length !== 1) {
        throw Error('Config Generators must take 1 argument')
      }
    } else {
      throw Error(`Generator must be of type 'object' or 'function'`)
    }
  })
}

export * from './types'
