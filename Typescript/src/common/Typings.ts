
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
    GetClassesIDs(columnNumber: number): Array<[any, number]>;
}
