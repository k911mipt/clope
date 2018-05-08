import { ColumnNumber, IDataSource,
    ITransactionStore, Transaction, TransactionElement, UID } from "../common/Typings";
import RuleSet from "./RuleSet";
export default class TransactionStore<T> implements ITransactionStore  {

    private readonly ruleSet: RuleSet<T>;
    private readonly dataSource: IDataSource<T>;

    private readonly elementMaps: Map<ColumnNumber, Map<TransactionElement, UID>>;
    private elementMapsSize: number;

    /**
     * Store that creates map of datasource objects to their UIDs
     * Converts datasource transactions with variant objects to cute integer arrays with UIDs
     * Has a for-await-of cozy async iterator
     * @param dataSource Any async iterable source with transactions
     * @param ruleSet A compact ruleset with convert function from datasource row to an array of any
     * also contains rules for missing columns and class columns
     */
    constructor(dataSource: IDataSource<T>, ruleSet: RuleSet<T>) {
        this.ruleSet = ruleSet;
        this.dataSource = dataSource;

        this.elementMaps = new Map<ColumnNumber, Map<TransactionElement, UID>>();
        this.elementMapsSize = 0;
    }

    /**
     * Returns size of internal map
     */
    get size(): number {
        return this.elementMapsSize;
    }

    /**
     * Async iterator on given datasource with on-the-wing convertation
     */
    public [Symbol.asyncIterator](): AsyncIterableIterator<Transaction> {
        const parent = this;
        async function* iterator(): AsyncIterableIterator<Transaction> {
            for await (const row of parent.dataSource) {
                const elements = parent.ruleSet.ApplyWithRules(row);
                yield parent.CreateTransaction(elements);
            }
        }
        return iterator();
    }

    /**
     * Procedure that runs over whole data source and fills
     * the object UID map
     */
    public async InitStore(): Promise<void> {
        for await (const row of this.dataSource) {
            const elements = this.ruleSet.Apply(row);
            for (let columnNumber = 0; columnNumber < elements.length; columnNumber++) {
                const element = elements[columnNumber];
                this.AddElementToMaps(columnNumber, element);
            }
        }
    }

    /**
     * Function, returning an array of classes and their UIDs,
     * using only internal map source, worthwhile to be called
     * only after initialization
     * @param columnNumber number of column, containing classes
     */
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
