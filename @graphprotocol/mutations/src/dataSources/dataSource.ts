type GetAbi = (name: string) => Promise<string | undefined>
type GetAddress = (name: string) => Promise<string | undefined>

export class DataSource {

  private _name: string
  private _abi?: string
  private _address?: string

  private _getAbi: GetAbi
  private _getAddress: GetAddress

  constructor(
    name: string,
    getAbi: GetAbi,
    getAddress: GetAddress
  ) {
    this._name = name
    this._getAbi = getAbi
    this._getAddress = getAddress
  }

  get name(): string {
    return this._name
  }

  get abi(): Promise<string | undefined> {
    return new Promise((resolve, reject) => {
      if (this._abi) {
        resolve(this._abi)
      } else {
        this._getAbi(this._name)
          .then(abi => this._abi = abi)
          .finally(() => resolve(this._abi))
          .catch(err => reject(err))
      }
    })
  }

  get address(): Promise<string | undefined> {
    return new Promise((resolve, reject) => {
      if (this._address) {
        resolve(this._address)
      } else {
        this._getAddress(this._name)
          .then(address => this._address = address)
          .finally(() => resolve(this._address))
          .catch(err => reject(err))
      }
    })
  }
}
