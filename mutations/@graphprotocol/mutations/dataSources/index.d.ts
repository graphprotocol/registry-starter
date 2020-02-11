import { DataSource } from './dataSource';
declare class DataSources {
    private _subgraph;
    private _metadataLink;
    private _ipfs;
    private _dataSources;
    constructor(subgraph: string, nodeEndpoint: string, ipfsEndpoint: string);
    get(name: string): DataSource;
    private getAbi;
    private getAddress;
}
export { DataSource, DataSources };
