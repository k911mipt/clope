import { timingSafeEqual } from "crypto";
import { ITransaction, ITransactionElement, Transaction, TransactionElement } from "../clope/Transaction";
import { ITransactionDictionary, TransactionArrayDictionary } from "../common/TransactionDictionary";
import { IAsyncDataSource } from "../db/AsyncDataSource";
import { IRowConverter } from "./RowConverter";

export interface IRepository {
    FullFillObjectsTable(): Promise<void>;
    GetObjectsCount(): number;
    ReadUntilEnd(handleTransaction: (tr: ITransaction) => void): Promise<void>;
    UpdateSkipRules(clusterColumns?: number[], missedColumns?: number[]): void;
    GetClassesIDs(): ITransactionElement[];
}

export class Repository<TIn> implements IRepository {
    private dataSource: IAsyncDataSource<TIn>;
    private rowConverter: IRowConverter<TIn>;

    private elementMap: ITransactionDictionary<number>;
    private classesMap: ITransactionDictionary<number>;
    private classesIDs: TransactionElement[];
    private nullElements: Set<any>;
    private missedColumns: Set<number>;
    private clusterColumns: Set<number>;

    constructor(datasource: IAsyncDataSource<TIn>, rowConverter: IRowConverter<TIn>, nullElements?: Set<any>, clusterColumns?: Set<number>, missedColumns?: Set<number>) {
        this.dataSource = datasource;
        this.rowConverter = rowConverter;

        this.elementMap = new TransactionArrayDictionary<number>();
        this.classesMap = new TransactionArrayDictionary<number>();
        this.classesIDs = new Array<TransactionElement>();

        this.nullElements = new Set<any>();
        if (nullElements != null) {
            nullElements.forEach((value) =>
                this.nullElements.add(value));
        }

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
    }
    public UpdateSkipRules(clusterColumns?: number[], missedColumns?: number[]): void {
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
    }
    public GetObjectsCount(): number {
        return this.elementMap.Count();
    }
    public FormNewTransaction(elements: any[]): ITransaction {
        // TODO: ПРОВЕРИТЬ НА РЕФАКТОРИНГ
        const transaction = new Transaction(elements.length);
        const transactionElement = new TransactionElement("", 0);
        for (let index = 0; index < elements.length; index++) {
            if (this.NeedToSkipColumn(index)) { continue; }
            const element = elements[index];
            if (this.nullElements.has(element)) { continue; }
            transactionElement.AttributeValue = element;
            transactionElement.NumberAttribute = index;
            const [success, elementKey] = this.elementMap.TryGetValue(transactionElement);
            if (success) {
                transaction.AddElementKey(elementKey);
            } else {
                throw new Error("Element was not found in map. Check for datasource was changed");
            }
        }
        return transaction;
    }

    public ReadUntilEnd(HandleTransaction: (tr: ITransaction) => void): Promise<void> {
        const convertAndHandle = ((row: TIn) => {
            const elements = this.rowConverter.Convert(row);
            HandleTransaction(this.FormNewTransaction(elements));
        }).bind(this);

        return this.dataSource.connect()
            .then(() => {
                this.dataSource.readNext(convertAndHandle);
                return this.dataSource.reset();
            });
    }

    public FullFillObjectsTable(): Promise<void> {
        return this.dataSource
            .connect()
            .then(() => this.dataSource.readNext((row) => this.ProcessRowToMap(this.rowConverter.Convert(row))))
            .then(() => this.dataSource.reset())
            .catch((er) => {
                console.log(er);
                return Promise.reject(er);
            });
    }
    public ProcessRowToMap(elements: any[]): void {
        const transactionElement = new TransactionElement("", 0);
        for (let index = 0; index < elements.length; index++) {
            const element = elements[index];
            transactionElement.AttributeValue = element;
            transactionElement.NumberAttribute = index;
            this.elementMap.Add(transactionElement, this.elementMap.Count());
        }
    }
    public GetClassesIDs(): ITransactionElement[] {
        const classesIDs = new Array<TransactionElement>();
        this.elementMap.forEach((uniqueNumber, transactionElement) => {
            if (this.clusterColumns.has(transactionElement.NumberAttribute)) {
                this.classesMap.Add(transactionElement, uniqueNumber);
                classesIDs.push(new TransactionElement(transactionElement.AttributeValue, uniqueNumber));
            }
        });
        return classesIDs;
    }
    private NeedToSkipColumn = (index: number) => this.missedColumns.has(index);
}
