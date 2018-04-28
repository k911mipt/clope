
// Transaction element characteristics
export type TransactionElement = any;
export type UID = number;
export type ColumnNumber = number;

export type Transaction = UID[];

export interface IDataSource<T> {
    ReadAll(callback: (row: T) => void): Promise<void>;
}

export interface ITransactionStore extends IDataSource<Transaction> {
    size: number;
    InitStore(): void;
    GetClassesIDs(columnNumber: number): Array<[TransactionElement, UID]>;
}

export interface IDataSourceIterator<T> {
    [Symbol.asyncIterator](): AsyncIterableIterator<T>;
}

export interface ITransactionStoreIterator extends IDataSourceIterator<Transaction> {
    size: number;
    InitStore(): void;
    iterator(): AsyncIterableIterator<Transaction>;
    // GetNextTransaction(): Promise<Transaction | null>;
    GetClassesIDs(columnNumber: number): Array<[TransactionElement, UID]>;
}
