import { ColumnNumber, IDataSourceIterator, ITransactionStore,
    ITransactionStoreIterator, Transaction, TransactionElement, UID } from "../common/Typings";
import RuleSet from "./RuleSet";

export default class TransactionStoreIterator<T> implements ITransactionStoreIterator  {

    private readonly ruleSet: RuleSet<T>;
    private readonly dataSource: IDataSourceIterator<T>;

    private readonly elementMaps: Map<ColumnNumber, Map<TransactionElement, UID>>;
    private elementMapsSize: number;

    constructor(dataSource: IDataSourceIterator<T>, ruleSet: RuleSet<T>) {
        this.ruleSet = ruleSet;
        this.dataSource = dataSource;

        this.elementMaps = new Map<ColumnNumber, Map<TransactionElement, UID>>();
        this.elementMapsSize = 0;
    }

    get size(): number {
        return this.elementMapsSize;
    }

    get isEnded(): boolean {
        return this.dataSource.isEnded;
    }

    public Connect(): void {
        throw new Error("Method not implemented.");
    }

    public async InitStore(): Promise<void> {
        // While not EOF, read & process
        this.dataSource.Connect();
        while (!this.dataSource.isEnded) {
            const row = await this.dataSource.ReadNextRow();
            // if (!row) { throw new Error("null row"); }
            if (!row) {
                console.log("got null on store init");
                continue;
            }
            const elements = this.ruleSet.Apply(row);
            for (let columnNumber = 0; columnNumber < elements.length; columnNumber++) {
                const element = elements[columnNumber];
                this.AddElementToMaps(columnNumber, element);
            }
        }
    }

    public async ReadNextRow(): Promise<Transaction | null> {
        const row = await this.dataSource.ReadNextRow();
        // if (!row) { throw new Error("null row"); }
        if (!row) {
            console.log("got null on transform transaction");
            return null;
        }
        const elements = this.ruleSet.ApplyWithRules(row);
        return this.CreateTransaction(elements);
    }

    public GetNextTransaction(): Promise<Transaction | null> {
        return this.ReadNextRow();
    }

    public Reset(): void {
        this.dataSource.Reset();
    }

    public GetClassesIDs(columnNumber: number): Array<[TransactionElement, UID]> {
        const classesIDs = new Array<[TransactionElement, UID]>();
        const map = this.elementMaps.get(columnNumber);
        if (map) {
            map.forEach((uid, element) => {
                classesIDs.push([element, uid]);
            });
        }
        return classesIDs;
    }

    private AddElementToMaps(columnNumber: ColumnNumber, element: TransactionElement) {
        let columnMap = this.elementMaps.get(columnNumber);
        if (!columnMap) {
            columnMap = new Map<TransactionElement, UID>();
            this.elementMaps.set(columnNumber, columnMap);
        }
        if (columnMap.has(element)) {
            return;
        }
        columnMap.set(element, this.GetNewUID());
    }

    private GetNewUID(): UID {
        return this.elementMapsSize++;
    }

    private CreateTransaction(elements: TransactionElement[]): Transaction {
        const transaction = [];
        for (let columnNumber = 0; columnNumber < elements.length; columnNumber++) {
            const element = elements[columnNumber];
            if (!element) { continue; }

            const columnMap = this.elementMaps.get(columnNumber);
            if (columnMap == null) {
                console.log("Column was not found in maps, seems datasource is changed. Results will be incorrect!");
                continue;
            }

            const uid = columnMap.get(element);
            if (uid == null) {
                console.log("Element was not found in map, seems datasource is changed. Results will be incorrect!");
                continue;
            }

            transaction.push(uid);
        }
        return transaction;
    }
}
