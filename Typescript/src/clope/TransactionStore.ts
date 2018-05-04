import { ColumnNumber, IDataSource,
    ITransactionStore, Transaction, TransactionElement, UID } from "../common/Typings";
import RuleSet from "./RuleSet";
(Symbol as any).asyncIterator = Symbol.asyncIterator || Symbol.iterator || Symbol.for("Symbol.asyncIterator");

export default class TransactionStoreIterator<T> implements ITransactionStore  {

    private readonly ruleSet: RuleSet<T>;
    private readonly dataSource: IDataSource<T>;

    private readonly elementMaps: Map<ColumnNumber, Map<TransactionElement, UID>>;
    private elementMapsSize: number;

    constructor(dataSource: IDataSource<T>, ruleSet: RuleSet<T>) {
        this.ruleSet = ruleSet;
        this.dataSource = dataSource;

        this.elementMaps = new Map<ColumnNumber, Map<TransactionElement, UID>>();
        this.elementMapsSize = 0;
    }

    get size(): number {
        return this.elementMapsSize;
    }

    public [Symbol.asyncIterator](): AsyncIterableIterator<Transaction> {
        // tslint:disable-next-line:no-this-assignment
        const parent = this;
        async function* iterator(): AsyncIterableIterator<Transaction> {
            for await (const row of parent.dataSource) {
                const elements = parent.ruleSet.ApplyWithRules(row);
                yield parent.CreateTransaction(elements);
            }
        }
        return iterator();
    }

    public async InitStore(): Promise<void> {
        for await (const row of this.dataSource[Symbol.asyncIterator]()) {
            const elements = this.ruleSet.Apply(row);
            for (let columnNumber = 0; columnNumber < elements.length; columnNumber++) {
                const element = elements[columnNumber];
                this.AddElementToMaps(columnNumber, element);
            }
        }
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
