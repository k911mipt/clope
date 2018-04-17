import { TransactionElement } from './../clope/Transaction';
import { Dictionary } from './../common/Dictionary';
import { ITransaction } from '../common/types';
import { IAsyncDataSource } from '../db/AsyncDataSource';
import { IRowConverter } from './RowConverter';

//export interface IMapper<TRow, IAsyncDataSource> {
export interface IMapper<TRow, TDataSource extends IAsyncDataSource<TRow>> {
    FormNewTransaction(elements: Array<any>): ITransaction;
    FullFillObjectsTable(): void;
}
export abstract class Mapper<TRow, TDataSource extends IAsyncDataSource<TRow>> implements IMapper<TRow, IAsyncDataSource<TRow>> {
    private UniqueObjects: Dictionary<TransactionElement, number>;
    private dataSource: TDataSource;
    private rowMapper: IRowConverter<TRow>;

    constructor(datasource: TDataSource, rowMapper: IRowConverter<TRow>) {
        this.dataSource = datasource;
        this.UniqueObjects = new Dictionary<TransactionElement, number>();
        this.rowMapper = rowMapper;

    }
    FormNewTransaction(elements: any[]): ITransaction {
        throw new Error("Method not implemented.");
    }

    FullFillObjectsTable(): Promise<void> {
        return this.dataSource
            .connect()
            .then(() => {
                this.dataSource.readNext((row) => this.addOrSkipRow(this.rowMapper.map(row)))
                return this.dataSource.reset();
            })
    }
    public addOrSkipRow(elements: Array<any>): void {
        //FIXME: ЗАГЛУШКА МОЛОТИЛЬНИ
        console.log(elements);
    }
}
export class FileMapper<TRow extends string, TFileDataSource extends IAsyncDataSource<TRow>> extends Mapper<string, IAsyncDataSource<string>> {
    /**
     *
     */
    //constructor(datasource: TFileDataSource, rowMapper: IRowMapper<TRow>) {
    //    super(datasource, rowMapper);
    //}

}