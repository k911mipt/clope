import { ColumnNumber, IDataSource, ITransactionStore, Transaction, TransactionElement, UID } from "../common/Typings";
import RuleSet from "./RuleSet";

export default class TransactionStore<T> implements ITransactionStore  {
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

    public async InitStore() {
        try {
            // While not EOF, read & process
            await this.dataSource.ReadAll((row: T) => {
                const elements = this.ruleSet.Apply(row);
                for (let columnNumber = 0; columnNumber < elements.length; columnNumber++) {
                    const element = elements[columnNumber];
                    this.AddElementToMaps(columnNumber, element);
                }
            });
        } catch (e) {
            console.log("Transaction store initialization, ", e);
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

    public ReadAll(callback: (row: Transaction) => void): Promise<void> {
        return this.dataSource.ReadAll((row) => {
                const elements = this.ruleSet.ApplyWithRules(row);
                callback(this.CreateTransaction(elements));
        });
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
        columnMap.set(element, this.getNewUID());
    }

    private getNewUID(): UID {
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
