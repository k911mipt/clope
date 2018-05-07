
// Transaction element characteristics
export type TransactionElement = any;
export type UID = number;
export type ColumnNumber = number;

export type Transaction = UID[];

export interface IDataSource<T> {
    [Symbol.asyncIterator](): AsyncIterableIterator<T>;
}

/**
 * Transaction store interface, used by clope algorithm
 * Performs convertation of transactions from datasource to
 * normalized form
 */
export interface ITransactionStore extends IDataSource<Transaction> {
    size: number;
    InitStore(): void;
    GetClassesIDs(columnNumber: number): Array<[TransactionElement, UID]>;
}
