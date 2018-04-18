import { ITransaction, Transaction, TransactionElement } from "../clope/Transaction";
import { TransactionDictionary } from "../common/TransactionDictionary";
import { IAsyncDataSource } from "../db/AsyncDataSource";
import { IRowConverter } from "./RowConverter";

export interface ITransactionStore {
    FullFillObjectsTable(): Promise<void>;
    GetObjectsCount(): number;
    readUntilEnd(handleTransaction: (tr: ITransaction) => void): Promise<void>;
}

export abstract class TransactionStore<TIn> implements ITransactionStore {
    private UniqueObjects: TransactionDictionary<number>;
    private dataSource: IAsyncDataSource<TIn>;
    private rowConverter: IRowConverter<TIn>;

    constructor(datasource: IAsyncDataSource<TIn>, rowConverter: IRowConverter<TIn>) {
        this.dataSource = datasource;
        this.UniqueObjects = new TransactionDictionary<number>();
        this.rowConverter = rowConverter;

    }
    GetObjectsCount(): number {
        return this.UniqueObjects.Count();
    }

    FormNewTransaction(elements: any[]): ITransaction {
        //FIXME: ПРОВЕРИТЬ НА РЕФАКТОРИНГ
        let transaction = new Transaction(elements.length);
        let transactionElement = new TransactionElement('', 0)
        elements.forEach((element, index) => {
            if (element != '?') {
                transactionElement.Value = element;
                transactionElement.NumberAttribute = index;
                let [success, elementKey] = this.UniqueObjects.TryGetValue(transactionElement);
                if (success)
                    transaction.AddElementKey(elementKey);
                else
                    throw new Error("Объект не найден в списке. Проверьте, не изменился ли файл за время работы программы!");
            }
        })
        return transaction;
    }

    readUntilEnd(handleTransaction: (tr: ITransaction) => void): Promise<void> {
        const convertAndHandle = ((row: TIn) => {
            const elements = this.rowConverter.convert(row);
            handleTransaction(this.FormNewTransaction(elements));
        }).bind(this)

        return this.dataSource.connect()
            .then(() => {
                this.dataSource.readNext(convertAndHandle)
                return this.dataSource.reset()
            })
    }

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
        for (let index = 0; index < elements.length; index++) {
            const element = elements[index];
            if (element == '?') continue;
            transactionElement.Value = element;
            transactionElement.NumberAttribute = index;
            this.UniqueObjects.Add(transactionElement, this.UniqueObjects.Count())
        }
        // elements.forEach((element, index) => {
        //     if (element != '?') {

        //     }
        // })
    }
    DisplayObjects(): void {
        console.log(this.UniqueObjects);
    }
}


export class TransactionFileStore extends TransactionStore<string> {
    /**
     *
     */
    //constructor(datasource: TFileDataSource, rowMapper: IRowMapper<TRow>) {
    //    super(datasource, rowMapper);
    //}
}