"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DataSource {
    constructor(name, getAbi, getAddress) {
        this._name = name;
        this._getAbi = getAbi;
        this._getAddress = getAddress;
    }
    get name() {
        return this._name;
    }
    get abi() {
        return new Promise((resolve, reject) => {
            if (this._abi) {
                resolve(this._abi);
            }
            else {
                this._getAbi(this._name)
                    .then(abi => this._abi = abi)
                    .finally(() => resolve(this._abi))
                    .catch(err => reject(err));
            }
        });
    }
    get address() {
        return new Promise((resolve, reject) => {
            if (this._address) {
                resolve(this._address);
            }
            else {
                this._getAddress(this._name)
                    .then(address => this._address = address)
                    .finally(() => resolve(this._address))
                    .catch(err => reject(err));
            }
        });
    }
}
exports.DataSource = DataSource;
//# sourceMappingURL=dataSource.js.map