import { TransactionElement, Transaction } from './../clope/Transaction';
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
    private rowConverter: IRowConverter<TRow>;

    constructor(datasource: TDataSource, rowConverter: IRowConverter<TRow>) {
        this.dataSource = datasource;
        this.UniqueObjects = new Dictionary<TransactionElement, number>();
        this.rowConverter = rowConverter;

    }
    FormNewTransaction(elements: any[]): ITransaction {
        //FIXME: ПРОВЕРИТЬ НА РЕФАКТОРИНГ
        let transaction = new Transaction(elements.length);
        elements.forEach((element, index) => {
            let [success, elementKey] = this.UniqueObjects.TryGetValue(element);
            if (success)
                transaction.AddElementKey(elementKey);
            else
                throw new Error("Объект не найден в списке. Проверьте, не изменился ли файл за время работы программы!");
        })
        return transaction;
    }
    //GetNextTransaction()

    FullFillObjectsTable(): Promise<void> {
        return this.dataSource
            .connect()
            .then(() => this.dataSource.readNext((row) => this.processRowToMap(this.rowConverter.convert(row))))
            .then(() => this.dataSource.reset())
            .then(this.DisplayObjects.bind(this))
            .catch(er => {
                console.log(er)
                return Promise.reject(er)
            })
    }
    public processRowToMap(elements: Array<any>): void {
        //FIXME: ОБРАТИТЬ ВНИМАНИЕ, ПРОБЛЕМЫ С ОПТИМАЛЬНОСТЬЮ. довести IDictionary до ума
        let transaction = new Transaction(elements.length);
        let transactionElement = new TransactionElement('', 0)
        elements.forEach((element, index) => {
            transactionElement.Value = element;
            transactionElement.NumberAttribute = index;
            this.UniqueObjects.Add(transactionElement, this.UniqueObjects.Count())
        })
    }
    DisplayObjects(): void {
        console.log(this.UniqueObjects);
    }
    // readNext(myAction: (row: string) => void): void {
    //     if (this.fileLineReader == null) throw Error("file is not connected")
    //     this.fileLineReader.on('line', (line) => myAction(line))
    // }
    //public processNextTransaction(myAction)
}


export class FileMapper<TRow extends string, TFileDataSource extends IAsyncDataSource<TRow>> extends Mapper<string, IAsyncDataSource<string>> {
    /**
     *
     */
    //constructor(datasource: TFileDataSource, rowMapper: IRowMapper<TRow>) {
    //    super(datasource, rowMapper);
    //}
}