"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const dataSource_1 = require("./dataSource");
exports.DataSource = dataSource_1.DataSource;
const utils_1 = require("../utils");
const apollo_link_http_1 = require("apollo-link-http");
const ipfsHttpClient = require('ipfs-http-client');
class DataSources {
    constructor(subgraph, nodeEndpoint, ipfsEndpoint) {
        this._dataSources = {};
        this._subgraph = subgraph;
        this._metadataLink = new apollo_link_http_1.HttpLink({ uri: `${nodeEndpoint}/subgraphs` });
        const url = new URL(ipfsEndpoint);
        this._ipfs = ipfsHttpClient({
            protocol: url.protocol.replace(/[:]+$/, ''),
            host: url.hostname,
            port: url.port,
            'api-path': url.pathname.replace(/\/$/, '') + '/api/v0/',
        });
    }
    get(name) {
        if (!(name in this._dataSources)) {
            this._dataSources[name] = new dataSource_1.DataSource(name, (name) => this.getAbi(name), (name) => this.getAddress(name));
        }
        return this._dataSources[name];
    }
    getAbi(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data } = yield utils_1.getDataSource(this._metadataLink, this._subgraph, name);
            if (!data || data.subgraphs.length === 0 ||
                data.subgraphs[0].currentVersion.deployment.manifest.dataSources.length === 0) {
                throw new Error(`Error fetching dataSource from subgraph '${this._subgraph}' with name '${name}'`);
            }
            const abiName = data.subgraphs[0].currentVersion.deployment.manifest.dataSources[0].source.abi;
            const result = yield utils_1.getContractAbis(this._metadataLink, abiName);
            if (!result.data || result.data.ethereumContractAbis.length === 0) {
                throw new Error(`Error fetching ethereum contract abis with name '${abiName}'`);
            }
            const abi = result.data.ethereumContractAbis[0].file;
            const resp = yield this._ipfs.get(abi);
            if (resp.length === 0) {
                throw new Error(`Error fetching ABI from IPFS with name '${name}' and hash '${abi}'`);
            }
            return resp[0].content.toString('utf8');
        });
    }
    getAddress(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data } = yield utils_1.getDataSource(this._metadataLink, this._subgraph, name);
            if (!data || data.subgraphs.length === 0 ||
                data.subgraphs[0].currentVersion.deployment.manifest.dataSources.length === 0) {
                throw new Error(`Error fetching dataSource from subgraph '${this._subgraph}' with name '${name}'`);
            }
            return data.subgraphs[0].currentVersion.deployment.manifest.dataSources[0].source.address;
        });
    }
}
exports.DataSources = DataSources;
//# sourceMappingURL=index.js.map