//import { ITransaction } from './types';
export interface IDatabaseHandler {
    Connect(): boolean;
    Reset(): boolean;
    //ReadLineEvent(action: (tr: ITransaction) => void): void
    ReadLineEvent(action: (objects: Array<any>) => void): void
    Closed(): Promise<void>
}

export interface IAsyncDBHandler {
    Connect(): boolean;
    Reset(): boolean;
    ReadLineEvent(action: (objects: Array<any>) => void): void
    Closed(): Promise<void>
}




export interface ITransaction {
    readonly elementKeys: Array<number>;
    AddElementKey(idObject: number): void
}

export interface ITransactionElement {
    Value: any;
    NumberAttribute: number;
    UniqueNumber: number;
}



export interface ICluster {

}

export interface IClopePoCPromise {

}
