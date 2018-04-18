export interface IAsyncDataSource<TRow> {
    //isEnd: boolean;
    reset(): Promise<void>;
    connect(): Promise<void>;
    readNext(myAction: (row: TRow) => void): void;
}
export abstract class AsyncDataSource<TRow> implements IAsyncDataSource<TRow> {
    // isEnd: boolean;
    // constructor() {
    //     this.isEnd = true;
    // }
    abstract reset(): Promise<void>;
    abstract connect(): Promise<void>;
    abstract readNext(myAction: (row: TRow) => void): void;
}