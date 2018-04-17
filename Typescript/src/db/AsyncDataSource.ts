export interface IAsyncDataSource<TRow> {
    isEnd: boolean;
    reset(): Promise<void>; // or boolean
    connect(): Promise<void>;
    readNext(myAction: (row: TRow) => void): void;
}

export abstract class AsyncDataSource<TRow> implements IAsyncDataSource<TRow> {
    isEnd: boolean;
    constructor() {
        this.isEnd = true;

    }
    public reset(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    public connect(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    public readNext(myAction: (row: TRow) => void): void {
        throw new Error("Method not implemented.");
    }
}