import { HttpLink } from 'apollo-link-http';
export declare const getDataSource: (link: HttpLink, subgraph: string, dataSource: string) => Promise<import("apollo-link").FetchResult<{
    [key: string]: any;
}, Record<string, any>, Record<string, any>>>;
export declare const getContractAbis: (link: HttpLink, name: string) => Promise<import("apollo-link").FetchResult<{
    [key: string]: any;
}, Record<string, any>, Record<string, any>>>;
