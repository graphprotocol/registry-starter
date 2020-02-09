declare type GetAbi = (name: string) => Promise<string | undefined>;
declare type GetAddress = (name: string) => Promise<string | undefined>;
export declare class DataSource {
    private _name;
    private _abi?;
    private _address?;
    private _getAbi;
    private _getAddress;
    constructor(name: string, getAbi: GetAbi, getAddress: GetAddress);
    get name(): string;
    get abi(): Promise<string | undefined>;
    get address(): Promise<string | undefined>;
}
export {};
