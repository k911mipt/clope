export interface IDataSourceAsync<TRow> {
    Reset(): Promise<void>;
    Connect(): Promise<void>;
    ReadNext(myAction: (row: TRow) => void): void;
}
// export abstract class AsyncDataSource<TRow> implements IAsyncDataSource<TRow> {
//     abstract reset(): Promise<void>;
//     abstract connect(): Promise<void>;
//     abstract readNext(myAction: (row: TRow) => void): void;
// }
