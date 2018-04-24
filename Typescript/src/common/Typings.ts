
// Transaction element characteristics
export type TransactionElement = any;
export type UID = number;
export type ColumnNumber = number;

export interface ITransaction {
    size: number;
    GetElementUID(num: number): UID;
    // AddElementKey(uid: UID): void;
}

export interface IDataSource<T> {
    ReadAll(callback: (row: T) => void): Promise<void>;
}

export interface ITransactionStore extends IDataSource<ITransaction> {
    size: number;
    InitStore(): void;
    GetClassesIDs(columnNumber: number): Array<[any, number]>;
}
