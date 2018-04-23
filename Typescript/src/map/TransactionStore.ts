import Transaction from "../clope/Transaction";
import { IDataSource } from "../db/DataSource";
import RuleSet from "./RuleSet";

type UID = number;
type ColumnNumber = number;
export interface ITransactionStore extends IDataSource<Transaction> {
    size: number;
    InitStore(): void;
    GetClassesIDs(columnNumber: number): Array<[any, number]>;
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
        try {
            // While not EOF, read & process
            await this.dataSource.ReadAll((row: T) => {
                const elements = this.ruleSet.Apply(row);
                for (let index = 0; index < elements.length; index++) {
                    const element = elements[index];
                    this.AddElement(index, element);
                }
            });
        } catch (e) {
            console.log("Transaction store initizlization, ", e);
        }
    }

    public GetClassesIDs(columnNumber: number): Array<[any, number]> {
        const classesIDs = new Array<[any, number]>();
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
                const elements = this.ruleSet.ApplyWithRules(row);
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

        map.set(key, this.mapSize);
        this.mapSize++;
    }

    private CreateTransaction(elements: any[]) {
        const transaction = new Transaction(elements.length);

        for (let index = 0; index < elements.length; index++) {
            const element = elements[index];
            if (!element) { continue; }

            const map = this.elementMap.get(index);
            if (map != null) {
                const uid = map.get(element);
                if (uid != null) {
                    transaction.AddElementKey(uid);
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
