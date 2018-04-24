import { ColumnNumber, IDataSource, ITransactionStore, TransactionElement, UID } from "../common/Typings";
import RuleSet from "./RuleSet";
import Transaction from "./Transaction";

export default class TransactionStore<T> implements ITransactionStore  {
    private readonly ruleSet: RuleSet<T>;
    private readonly dataSource: IDataSource<T>;

    private readonly elementMap: Map<ColumnNumber, Map<TransactionElement, UID>>;
    private mapSize: number;

    constructor(dataSource: IDataSource<T>, ruleSet: RuleSet<T>) {
        this.ruleSet = ruleSet;
        this.dataSource = dataSource;
        this.elementMap = new Map<ColumnNumber, Map<TransactionElement, UID>>();

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
                    this.AddElement(columnNumber, element);
                }
            });
        } catch (e) {
            console.log("Transaction store initizlization, ", e);
        }
    }

    public GetClassesIDs(columnNumber: number): Array<[TransactionElement, UID]> {
        const classesIDs = new Array<[TransactionElement, UID]>();
        const map = this.elementMap.get(columnNumber);
        if (map) {
            map.forEach((uid, key) => {
                classesIDs.push([key, uid]);
            });
        }
        return classesIDs;
    }

    public ReadAll(callback: (row: Transaction) => void): Promise<void> {
        return this.dataSource.ReadAll((row) => {
                // Вариант с Map<ColumnNumber, TransactionElement> вместо массива, содержащего null элементы,
                // оказывается медленнее на 20%. Реализация для демонстрации:

                // const elements = this.ruleSet.ApplyWithRulesToMap(row);
                // callback(this.CreateTransactionFromMap(elements));

                // Нормальная реализация
                const elements = this.ruleSet.ApplyWithRules(row);
                callback(this.CreateTransaction(elements));
        });
    }

    private AddElement(columnNumber: ColumnNumber, key: TransactionElement) {
        let map = this.elementMap.get(columnNumber);

        if (!map) {
            map = new Map<TransactionElement, UID>();
            this.elementMap.set(columnNumber, map);
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

            const map = this.elementMap.get(columnNumber);
            if (map == null) {
                throw new Error("Element was not found in map");
            }
            const uid = map.get(element);
            if (uid == null) {
                throw new Error("Element was not found in map");
            }
            transaction.AddElementKey(uid);
        }
        return transaction;
    }
    private CreateTransactionFromMap(elements: Map<ColumnNumber, TransactionElement>) {
        const transaction = new Transaction(elements.size);
        elements.forEach((element, columnNumber) => {
            const map = this.elementMap.get(columnNumber);
            if (map == null) {
                throw new Error("Element was not found in map");
            }
            const uid = map.get(element);
            if (uid == null) {
                throw new Error("Element was not found in map");
            }
            transaction.AddElementKey(uid);
        });
        return transaction;
    }
}
