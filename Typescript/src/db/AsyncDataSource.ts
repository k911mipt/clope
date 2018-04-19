export interface IAsyncDataSource<TRow> {
    reset(): Promise<void>;
    connect(): Promise<void>;
    readNext(myAction: (row: TRow) => void): void;
}
export abstract class AsyncDataSource<TRow> implements IAsyncDataSource<TRow> {
    abstract reset(): Promise<void>;
    abstract connect(): Promise<void>;
    abstract readNext(myAction: (row: TRow) => void): void;
}