import { ITransaction, Transaction, ITransactionElement, TransactionElement, ITransactionWithMissedClusters, TransactionWithMissedClusters } from "../clope/Transaction";
import { TransactionArrayDictionary, ITransactionDictionary, TransactionMapDictionary } from "../common/TransactionDictionary";
import { IAsyncDataSource } from "../db/AsyncDataSource";
import { IRowConverter } from "./RowConverter";
import { timingSafeEqual } from "crypto";

export interface IRepository {
    FullFillObjectsTable(): Promise<void>;
    GetObjectsCount(): number;
    ReadUntilEnd(handleTransaction: (tr: ITransaction) => void): Promise<void>;
    UpdateSkipRules(clusterColumns?: Array<number>, missedColumns?: Array<number>): void;
    HasMissedColumns(): boolean;
    GetClassesIDs(): Array<ITransactionElement>;
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
    private CreateNewTransaction: (capacity: number) => ITransaction;
    private AddElementToTransaction: (transaction: ITransaction, index: number, elementKey?: number) => void;


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

        this.missedColumns = new Set<number>();
        if (missedColumns != null) {
            missedColumns.forEach((value) =>
                this.missedColumns.add(value));
        }
        //this.missedColumns = this.clusterColumns;
        // this.createNewTransaction = this.setNewTransactionConstructor(clusterColumns != null);
        // this.addElementToTransaction = this.setTransactionElementAdder(clusterColumns != null);
        this.CreateNewTransaction = this.SetNewTransactionConstructor(false)
        this.AddElementToTransaction = this.SetTransactionElementAdder(false);
    }
    public UpdateSkipRules(clusterColumns?: Array<number>, missedColumns?: Array<number>): void {
        this.clusterColumns.delete;
        this.clusterColumns = new Set<number>();
        if (clusterColumns != null) {
            clusterColumns.forEach((value) =>
                this.clusterColumns.add(value));
        }

        this.missedColumns.delete;
        this.missedColumns = new Set<number>();
        if (missedColumns != null) {
            missedColumns.forEach((value) =>
                this.missedColumns.add(value));
        }
        //this.missedColumns = this.clusterColumns;
        this.CreateNewTransaction = this.SetNewTransactionConstructor(clusterColumns != null)
        this.AddElementToTransaction = this.SetTransactionElementAdder(clusterColumns != null);
    }
    public GetObjectsCount(): number {
        return this.elementMap.Count();
    }
    //FIXME: удалить функцию и зависимости
    public HasMissedColumns = () => false//(this.missedColumns.size > 0)
    private NeedToSkipColumn = (index: number) => this.missedColumns.has(index);

    //FIXME: удалить функцию и зависимости
    private SetNewTransactionConstructor(hasMissedClusters: boolean): (capacity: number) => ITransaction {
        if (hasMissedClusters)
            return (capacity: number) => new TransactionWithMissedClusters(capacity)
        else
            return (capacity: number) => new Transaction(capacity)
    }
    //FIXME: удалить функцию и зависимости
    private SetTransactionElementAdder(hasMissedClusters: boolean):
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
        const transaction = this.CreateNewTransaction(elements.length)
        const transactionElement = new TransactionElement('', 0)
        for (let index = 0; index < elements.length; index++) {
            if (this.NeedToSkipColumn(index)) continue;
            const element = elements[index];
            if (this.nullElements.has(element)) continue;
            transactionElement.AttributeValue = element;
            transactionElement.NumberAttribute = index;
            //if (this.classesMap.ContainsKey(transactionElement)) continue;
            let [success, elementKey] = this.elementMap.TryGetValue(transactionElement);
            if (success)
                this.AddElementToTransaction(transaction, index, elementKey)
            else
                throw new Error("Элемент не найден в карте соответствий. Источник данных был изменён за время работы программы!");
        }
        return transaction;
    }

    ReadUntilEnd(HandleTransaction: (tr: ITransaction) => void): Promise<void> {
        const convertAndHandle = ((row: TIn) => {
            const elements = this.rowConverter.convert(row);
            HandleTransaction(this.FormNewTransaction(elements));
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
            .then(() => this.dataSource.readNext((row) => this.ProcessRowToMap(this.rowConverter.convert(row))))
            .then(() => this.dataSource.reset())
            .catch(er => {
                console.log(er)
                return Promise.reject(er)
            })
    }
    public ProcessRowToMap(elements: Array<any>): void {
        const transactionElement = new TransactionElement('', 0)
        for (let index = 0; index < elements.length; index++) {
            const element = elements[index];
            transactionElement.AttributeValue = element;
            transactionElement.NumberAttribute = index;
            this.elementMap.Add(transactionElement, this.elementMap.Count())
        }
    }
    public GetClassesIDs(): Array<ITransactionElement> {
        const classesIDs = new Array<TransactionElement>();
        this.elementMap.forEach((uniqueNumber, transactionElement) => {
            if (this.clusterColumns.has(transactionElement.NumberAttribute)) {
                this.classesMap.Add(transactionElement, uniqueNumber);
                classesIDs.push(new TransactionElement(transactionElement.AttributeValue, uniqueNumber))
            }
        })
        return classesIDs;
    }
}