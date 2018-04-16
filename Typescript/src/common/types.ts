//import { ITransaction } from './types';
export interface IDatabaseHandler {
    connect(): boolean;
    reset(): boolean;
    readNextTransaction(): ITransaction
}

export interface IAsyncDBHandler {
    connect(): boolean;
    reset(): boolean;
    readLineEvent(action: (tr: ITransaction) => void): void
    closed(action: () => void): void
}

export interface IAsyncDBHandlerPromise {
    connect(): boolean;
    reset(): boolean;
    readLineEvent(action: (tr: ITransaction) => void): void
    closed(): Promise<void>
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
