
// Transaction element characteristics
export type TransactionElement = any;
export type UID = number;
export type ColumnNumber = number;

export type Transaction = UID[];

export interface IDataSourceIterator<T> {
    [Symbol.asyncIterator](): AsyncIterableIterator<T>;
}

export interface ITransactionStore extends IDataSourceIterator<Transaction> {
    size: number;
    InitStore(): void;
    GetClassesIDs(columnNumber: number): Array<[TransactionElement, UID]>;
}
