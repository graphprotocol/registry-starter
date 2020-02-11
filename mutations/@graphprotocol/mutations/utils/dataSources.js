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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_link_1 = require("apollo-link");
const graphql_tag_1 = __importDefault(require("graphql-tag"));
const GET_DATASOURCE = graphql_tag_1.default `
  query GetDataSource($subgraph: String, $dataSource: String) {
    subgraphs {
      currentVersion {
        deployment {
          manifest {
            dataSources (where: {name: $dataSource}) {
              source {
                address
                abi
              }
            }
          }
        }
      }
    }
  }
`;
const GET_CONTRACT_ABIS = graphql_tag_1.default `
  query GetContractAbis($name: String) {
    ethereumContractAbis (where: {name: $name}) {
        file
      }
    }
`;
exports.getDataSource = (link, subgraph, dataSource) => __awaiter(void 0, void 0, void 0, function* () {
    return yield apollo_link_1.makePromise(apollo_link_1.execute(link, {
        query: GET_DATASOURCE,
        variables: {
            subgraph,
            dataSource
        }
    }));
});
exports.getContractAbis = (link, name) => __awaiter(void 0, void 0, void 0, function* () {
    return yield apollo_link_1.makePromise(apollo_link_1.execute(link, {
        query: GET_CONTRACT_ABIS,
        variables: {
            name
        }
    }));
});
//# sourceMappingURL=dataSources.js.map