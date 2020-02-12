import {
  createConfig,
  validateConfig
} from '../'

describe('Mutations Config', () => {

  describe('validateConfig', () => {

    it(`Generator isn't a function`, () => {
      try {
        validateConfig(
          { value: true },
          { value: true }
        )
        throw Error('This should never happen...')
      } catch (e) {
        expect(e.message).toBe(`Generator must be of type 'object' or 'function'`)
      }
    })

    it(`Nested generator isn't a function`, () => {
      try {
        validateConfig(
          { something: { } },
          { something: { } }
        )
        throw Error('This should never happen...')
      } catch (e) {
        expect(e.message).toBe('Config Generators must be a function, or an object that contains functions.')
      }
    })

    it(`Argument doesn't exist`, () => {
      try {
        validateConfig(
          { },
          { value: (arg: string) => arg }
        )
        throw Error('This should never happen...')
      } catch (e) {
        expect(e.message).toBe(`Failed to find mutation configuration value for the property 'value'.`)
      }
    })

    it(`Nested argument doesn't exist`, () => {
      try {
        validateConfig(
          { something: { } },
          { something: { value: (value: string) => value } }
        )
        throw Error('This should never happen...')
      } catch (e) {
        expect(e.message).toBe(`Failed to find mutation configuration value for the property 'value'.`)
      }
    })

    it('Config generators must take one argument', () => {
      try {
        validateConfig(
          { something: "" },
          { something: () => "" }
        )
        throw Error('This should never happen...')
      } catch (e) {
        expect(e.message).toBe('Config Generators must take 1 argument')
      }
    })

    it('Support empty config', () => {
      validateConfig({ }, { })
    })
  })

  describe('createConfig', () => {

    it('Sanity', async () => {
      const config = await createConfig(
        { value: true },
        { value: (arg: boolean) => `${arg}` }
      )

      expect(config.value).toBe('true')
    })

    it('Async generator', async () => {
      const config = await createConfig(
        { value: true },
        {
          value: async (arg: boolean) => {
            await new Promise(resolve => setTimeout(resolve, 200))
            return `${arg}`
          }
        }
      )

      expect(config.value).toBe('true')
    })

    it('Nested generators', async () => {
      const config = await createConfig(
        { value: { a: true, b: false } },
        {
          value: {
            a: (arg: boolean) => `${arg}`,
            b: (arg: boolean) => `${arg}`
          }
        }
      )

      expect(config.value.a).toBe('true')
      expect(config.value.b).toBe('false')
    })

    it('Argument function', async () => {
      const config = await createConfig(
        {
          value: () => true
        },
        {
          value: (arg: boolean) => `${arg}`
        }
      )

      expect(config.value).toBe('true')
    })

    it('Async argument function', async () => {
      const config = await createConfig(
        {
          value: async () => {
            await new Promise(resolve => setTimeout(resolve, 200))
            return true
          }
        },
        {
          value: (arg: boolean) => `${arg}`
        }
      )

      expect(config.value).toBe('true')
    })

    it('Async argument function & generator', async () => {
      const config = await createConfig(
        {
          value: async () => {
            await new Promise(resolve => setTimeout(resolve, 200))
            return true
          }
        },
        {
          value: async (arg: boolean) => {
            await new Promise(resolve => setTimeout(resolve, 200))
            return `${arg}`
          }
        }
      )

      expect(config.value).toBe('true')
    })

    it('Argument function returns nested arguments', async () => {
      const config = await createConfig(
        {
          value: () => {
            return {
              a: true,
              b: false
            }
          }
        },
        {
          value: {
            a: (arg: boolean) => `${arg}`,
            b: (arg: boolean) => `${arg}`
          }
        }
      )

      expect(config.value.a).toBe('true')
      expect(config.value.b).toBe('false')
    })
  })
})
