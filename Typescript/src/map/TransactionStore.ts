import Transaction from "../clope/Transaction";
import { IDataSource } from "../db/DataSource";
import RuleSet from "./RuleSet";

type UID = number;
type ColumnNumber = number;
export interface ITransactionStore extends IDataSource<Transaction> {
    size: number;
    InitStore(): void;
}

export class TransactionStore<T> implements ITransactionStore  {
    private readonly ruleSet: RuleSet<T>;
    private readonly dataSource: IDataSource<T>;

    private readonly elementMap: Map<ColumnNumber, Map<any, UID>>;
    private mapSize: number;

    constructor(dataSource: IDataSource<T>, ruleSet: RuleSet<T>) {
        this.ruleSet = ruleSet;
        this.dataSource = dataSource;
        this.elementMap = new Map<ColumnNumber, Map<any, UID>>();

        this.mapSize = 0;
    }

    get size(): number {
        return this.mapSize;
    }

    public async InitStore() {
        await this.dataSource.ReadAll((row: T) => {
            const elements = this.ruleSet.apply(row);

            for (let index = 0; index < elements.length; index++) {
                const element = elements[index];
                this.AddElement(index, element);
            }
        });
    }
    // public async InitStore() {
    //     await this.dataSource.ReadAll(this.ProcessRow);
    // }
    // // FIXME: ПРИДУМАТЬ ИМЯ НЕ PROCESSROW
    // private ProcessRow(row: T): void {
    //     const elements = this.ruleSet.apply(row);

    //     for (let index = 0; index < elements.length; index++) {
    //         const element = elements[index];
    //         this.AddElement(index, element);
    //     }
    // }

    public ReadAll(callback: (row: Transaction) => void): Promise<void> {
        return this.dataSource.ReadAll((row) => {
                const elements = this.ruleSet.applyWithRules(row);
                callback(this.CreateTransaction(elements));
        });
    }

    private AddElement(columnNumber: ColumnNumber, key: any) {
        let map = this.elementMap.get(columnNumber);

        if (!map) {
            map = new Map<any, UID>();
            this.elementMap.set(columnNumber, map);
        }
        if (map.has(key)) {
            return;
        }

        this.mapSize++;
        map.set(key, this.mapSize);
    }

    private CreateTransaction(elements: any[]) {
        const transaction = new Transaction(elements.length);

        for (let index = 0; index < elements.length; index++) {
            const element = elements[index];
            if (!element) { continue; }

            const map = this.elementMap.get(index);
            if (map != null) {
                const value = map.get(element);
                if (value != null) {
                    transaction.AddElementKey(value);
                } else {
                    throw new Error("Element was not found in map");
                }
            } else {
                throw new Error("Element was not found in map");
            }
        }
        return transaction;
    }
}
