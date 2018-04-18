import { ITransaction, Transaction, ITransactionElement, TransactionElement } from "../clope/Transaction";
import { TransactionArrayDictionary, ITransactionDictionary, TransactionMapDictionary } from "../common/TransactionDictionary";
import { IAsyncDataSource } from "../db/AsyncDataSource";
import { IRowConverter } from "./RowConverter";

export interface IRepository {
    FullFillObjectsTable(): Promise<void>;
    GetObjectsCount(): number;
    readUntilEnd(handleTransaction: (tr: ITransaction) => void): Promise<void>;
}

export class Repository<TIn> implements IRepository {
    private dataSource: IAsyncDataSource<TIn>;
    private rowConverter: IRowConverter<TIn>;

    private elementMap: ITransactionDictionary<number>;
    private classesMap: ITransactionDictionary<number>;
    private classesIDs: Array<TransactionElement>;
    private nullElements: Set<any>;
    private missedColumns: Set<number>;


    constructor(datasource: IAsyncDataSource<TIn>, rowConverter: IRowConverter<TIn>, nullElements?: Array<any>, missedColumns?: Array<number>) {
        this.dataSource = datasource;
        this.rowConverter = rowConverter;

        this.elementMap = new TransactionArrayDictionary<number>();
        this.classesMap = new TransactionArrayDictionary<number>();
        this.classesIDs = new Array<TransactionElement>();
        this.nullElements = new Set<any>();
        if (nullElements != null)
            nullElements.forEach((value) =>
                this.nullElements.add(value));
        this.missedColumns = new Set<number>();
        if (missedColumns != null)
            missedColumns.forEach((value) =>
                this.missedColumns.add(value));

    }
    GetObjectsCount(): number {
        return this.elementMap.Count();
    }

    FormNewTransaction(elements: any[]): ITransaction {
        //FIXME: ПРОВЕРИТЬ НА РЕФАКТОРИНГ
        let transaction = new Transaction(elements.length);
        let transactionElement = new TransactionElement('', 0)
        for (let index = 0; index < elements.length; index++) {
            const element = elements[index];
            if (this.nullElements.has(element)) continue;
            //if (element == '?') continue;
            transactionElement.AttributeValue = element;
            transactionElement.NumberAttribute = index;
            //if (this.classesMap.ContainsKey(transactionElement)) continue;
            let [success, elementKey] = this.elementMap.TryGetValue(transactionElement);
            if (success)
                transaction.AddElementKey(elementKey);
            else
                throw new Error("Элемент не найден в карте соответствий. Источник данных был изменён за время работы программы!");
        }
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
            .then(() => this.dataSource.readNext((row) => this.processRowToRepository(this.rowConverter.convert(row))))
            //.then(this.setClassesIDs.bind(this))
            .then(() => this.dataSource.reset())
            .then(this.setClassesIDs.bind(this))
            //            .then(this.DisplayObjects.bind(this))
            .catch(er => {
                console.log(er)
                return Promise.reject(er)
            })
    }
    public processRowToRepository(elements: Array<any>): void {
        let transactionElement = new TransactionElement('', 0)
        for (let index = 0; index < elements.length; index++) {
            const element = elements[index];
            if (this.nullElements.has(element)) continue;
            //if (element == '?') continue;
            transactionElement.AttributeValue = element;
            transactionElement.NumberAttribute = index;
            this.elementMap.Add(transactionElement, this.elementMap.Count())
        }
    }
    // DisplayObjects(): void {
    //     console.log(this.elementMap);
    // }
    public setClassesIDs(): void {
        //const ids = this.classesIDs;
        //let ids = new Array<ITransactionElement>();
        this.elementMap.forEach((uniqueNumber, transactionElement) => {
            //if (transactionElement.NumberAttribute == 0)
            if (this.missedColumns.has(transactionElement.NumberAttribute)) {
                this.classesMap.Add(transactionElement, uniqueNumber);
                this.classesIDs.push(new TransactionElement(transactionElement.AttributeValue, uniqueNumber))
                //                console.log(transactionElement.AttributeValue, uniqueNumber);
            }
        })
    }
    public getClassesIDs(): Array<ITransactionElement> {
        return this.classesIDs;
    }
}


// export class TransactionFileStore extends TransactionStore<string> {
//     /**
//      *
//      */
//     //constructor(datasource: TFileDataSource, rowMapper: IRowMapper<TRow>) {
//     //    super(datasource, rowMapper);
//     //}
// }