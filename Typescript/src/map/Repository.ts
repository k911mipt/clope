import { ITransaction, Transaction, ITransactionElement, TransactionElement, ITransactionWithMissedClusters, TransactionWithMissedClusters } from "../clope/Transaction";
import { TransactionArrayDictionary, ITransactionDictionary, TransactionMapDictionary } from "../common/TransactionDictionary";
import { IAsyncDataSource } from "../db/AsyncDataSource";
import { IRowConverter } from "./RowConverter";

export interface IRepository {
    FullFillObjectsTable(): Promise<void>;
    GetObjectsCount(): number;
    readUntilEnd(handleTransaction: (tr: ITransaction) => void): Promise<void>;
    hasMissedColumns(): boolean;
}

export class Repository<TIn> implements IRepository {
    private dataSource: IAsyncDataSource<TIn>;
    private rowConverter: IRowConverter<TIn>;

    private elementMap: ITransactionDictionary<number>;
    private classesMap: ITransactionDictionary<number>;
    private classesIDs: Array<TransactionElement>;
    private nullElements: Set<any>;
    private missedColumns: Set<number>;
    private clusterColumns: Set<number>;
    private createNewTransaction: (capacity: number) => ITransaction;
    private addElementToTransaction: (transaction: ITransaction, index: number, elementKey?: number) => void;


    constructor(datasource: IAsyncDataSource<TIn>, rowConverter: IRowConverter<TIn>, nullElements?: Array<any>, clusterColumns?: Array<number>, missedColumns?: Array<number>) {
        this.dataSource = datasource;
        this.rowConverter = rowConverter;

        this.elementMap = new TransactionArrayDictionary<number>();
        this.classesMap = new TransactionArrayDictionary<number>();
        this.classesIDs = new Array<TransactionElement>();

        this.nullElements = new Set<any>();
        if (nullElements != null)
            nullElements.forEach((value) =>
                this.nullElements.add(value));

        this.clusterColumns = new Set<number>();
        if (clusterColumns != null) {
            clusterColumns.forEach((value) =>
                this.clusterColumns.add(value));
        }

        this.missedColumns = new Set<number>(this.clusterColumns);
        if (missedColumns != null) {
            missedColumns.forEach((value) =>
                this.missedColumns.add(value));
        }
        console.log(this.clusterColumns)
        console.log(this.missedColumns)
        //this.missedColumns = this.clusterColumns;
        this.createNewTransaction = this.setNewTransactionConstructor(clusterColumns != null)
        this.addElementToTransaction = this.setTransactionElementAdder(clusterColumns != null);
    }
    public GetObjectsCount(): number {
        return this.elementMap.Count();
    }
    public hasMissedColumns = () => (this.missedColumns.size > 0)


    private setNewTransactionConstructor(hasMissedClusters: boolean): (capacity: number) => ITransaction {
        if (hasMissedClusters)
            return (capacity: number) => new TransactionWithMissedClusters(capacity)
        else
            return (capacity: number) => new Transaction(capacity)
    }
    private setTransactionElementAdder(hasMissedClusters: boolean):
        (transaction: ITransaction, index: number, elementKey?: number) => void {
        if (hasMissedClusters)
            return (transaction: ITransaction, index: number, elementKey?: number) =>
                transaction.AddElementKey(elementKey, this.missedColumns.has(index))
        else
            return (transaction: ITransaction, index: number, elementKey?: number) =>
                transaction.AddElementKey(elementKey)
    }

    FormNewTransaction(elements: any[]): ITransaction {
        //TODO: ПРОВЕРИТЬ НА РЕФАКТОРИНГ
        const transaction = this.createNewTransaction(elements.length)
        const transactionElement = new TransactionElement('', 0)
        for (let index = 0; index < elements.length; index++) {
            const element = elements[index];
            if (this.nullElements.has(element)) continue;
            transactionElement.AttributeValue = element;
            transactionElement.NumberAttribute = index;
            //if (this.classesMap.ContainsKey(transactionElement)) continue;
            let [success, elementKey] = this.elementMap.TryGetValue(transactionElement);
            if (success)
                this.addElementToTransaction(transaction, index, elementKey)
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
        const transactionElement = new TransactionElement('', 0)
        for (let index = 0; index < elements.length; index++) {
            const element = elements[index];
            if (this.nullElements.has(element)) continue;
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
            if (this.clusterColumns.has(transactionElement.NumberAttribute)) {
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