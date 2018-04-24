import { ColumnNumber, IDataSource, ITransactionStore, TransactionElement, UID } from "../common/Typings";
import RuleSet from "./RuleSet";
import Transaction from "./Transaction";

export default class TransactionStore<T> implements ITransactionStore  {
    private readonly ruleSet: RuleSet<T>;
    private readonly dataSource: IDataSource<T>;

    private readonly elementMaps: Map<ColumnNumber, Map<TransactionElement, UID>>;
    private mapSize: number;

    constructor(dataSource: IDataSource<T>, ruleSet: RuleSet<T>) {
        this.ruleSet = ruleSet;
        this.dataSource = dataSource;

        this.elementMaps = new Map<ColumnNumber, Map<TransactionElement, UID>>();
        this.mapSize = 0;
    }

    get size(): number {
        return this.mapSize;
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
            console.log("Transaction store initizlization, ", e);
        }
    }

    public GetClassesIDs(columnNumber: number): Array<[TransactionElement, UID]> {
        const classesIDs = new Array<[TransactionElement, UID]>();
        const map = this.elementMaps.get(columnNumber);
        if (map) {
            map.forEach((uid, key) => {
                classesIDs.push([key, uid]);
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

    private AddElementToMaps(columnNumber: ColumnNumber, key: TransactionElement) {
        let map = this.elementMaps.get(columnNumber);
        if (!map) {
            map = new Map<TransactionElement, UID>();
            this.elementMaps.set(columnNumber, map);
        }
        if (map.has(key)) {
            return;
        }
        map.set(key, this.getNewUID());
    }

    private getNewUID(): UID {
        return this.mapSize++;
    }

    private CreateTransaction(elements: TransactionElement[]) {
        const transaction = new Transaction(elements.length);
        for (let columnNumber = 0; columnNumber < elements.length; columnNumber++) {
            const element = elements[columnNumber];
            if (!element) { continue; }

            const map = this.elementMaps.get(columnNumber);
            if (map == null) {
                console.log("Element was not found in map, seems datasource is changed. Results will be incorrect!");
                continue;
            }

            const uid = map.get(element);
            if (uid == null) {
                console.log("Element was not found in map, seems datasource is changed. Results will be incorrect!");
                continue;
            }

            transaction.AddElementKey(uid);
        }
        return transaction;
    }
}
