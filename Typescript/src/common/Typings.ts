
// Transaction element characteristics aliases
export type TransactionElement = any;
export type UID = number;
export type ColumnNumber = number;

export type Transaction = UID[];

/**
 * Raw data source with cozy async iterator over rows (T)
 */
export interface IDataSource<T> {
    /**
     * Async iterator over rows in data source
     */
    [Symbol.asyncIterator](): AsyncIterableIterator<T>;
}

/**
 * Transaction store interface, used by clope algorithm
 * Performs convertation of transactions from datasource to
 * normalized form
 */
export interface ITransactionStore extends IDataSource<Transaction> {
    /**
     * Size of internal map of transaction elements to their UIDs
     */
    size: number;

    /**
     * Procedure that runs over whole data source and fills
     * the object UID map
     */
    InitStore(): void;

    /**
     * Function, returning an array of classes and their UIDs,
     * using only internal map source, worthwhile to be called
     * only after initialization
     * @param columnNumber number of column, containing classes
     */
    GetClassesIDs(columnNumber: number): Array<[TransactionElement, UID]>;
}
