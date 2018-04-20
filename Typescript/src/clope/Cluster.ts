import MathSupport from "./MathSupport";
import { ITransaction } from "./Transaction";
export interface ICluster {
    readonly numTransactions: number;
    GetOCC(num: number): number;
    AddTransaction(transaction: ITransaction): void;
    DelTransaction(transaction: ITransaction): void;
    DeltaAdd(transaction: ITransaction): number;
    DeltaDel(transaction: ITransaction): number;
}

export class Cluster implements ICluster {
    public numTransactions: number;

    private width: number;  // Ширина кластера
    private square: number; // Площадь кластера
    private occ: { [key: number]: number; };     // Таблица количества объектов по номерам в кластере
    private mathSupport: MathSupport;

    constructor(capacity: number, mathSupport: MathSupport) {
        this.mathSupport = mathSupport;
        // this.occ = new Array<number>(capacity);
        // this.occ = {};
        this.occ = [];

        // Без предварительной инициализации в 1.5 раза медленнее
        for (let i = 0; i < capacity; i++) {
            this.occ[i] = 0;
        }

        this.width = 0;
        this.square = 0;
        this.numTransactions = 0;
    }
    public GetOCC(num: number) {
        return this.occ[num];
    }

    public AddTransaction(transaction: ITransaction): void {
        this.square += transaction.elementKeyCount;
        this.numTransactions++;
        for (let i = 0; i < transaction.elementKeyCount; i++) {
            if (this.IsElementDeterminative(transaction, i, 0)) {
                this.width++;
            }
            const key = transaction.GetElementKey(i);
            this.occ[key]++;
            // C такой реализацией в 1.5 раза медленнее
            // this.occ[key] = (this.occ[key] | 0) + 1;
        }
    }

    public DelTransaction(transaction: ITransaction): void {
        this.square -= transaction.elementKeyCount;
        this.numTransactions--;
        for (let i = 0; i < transaction.elementKeyCount; i++) {
            const key = transaction.GetElementKey(i);
            // console.assert(this.occ[key] > 0);
            this.occ[key]--;
            if (this.IsElementDeterminative(transaction, i, 0)) {
                this.width--;
            }
        }
    }

    public DeltaAdd(transaction: ITransaction): number {
        const sNew = this.square + transaction.elementKeyCount;
        let wNew = this.width;

        // TODO: Может, добавить хэшсет для ширины кластера, и не перебирать каждый раз весь occ[i],
        // а брать пересечение множеств транзакции и хэшсета
        for (let i = 0; i < transaction.elementKeyCount; i++) {
            if (this.IsElementDeterminative(transaction, i, 0)) {
                wNew++;
            }
        }
        if (this.numTransactions > 0) {
            return this.Grad(sNew, this.numTransactions + 1, wNew)
                - this.Grad(this.square, this.numTransactions, this.width);
        }
        return this.Grad(sNew, this.numTransactions + 1, wNew);

    }
    public DeltaDel(transaction: ITransaction): number {
        const sNew = this.square - transaction.elementKeyCount;
        let wNew = this.width;
        // tslint:disable-next-line:max-line-length
        console.assert(this.numTransactions >= 1, "Попытка удаления транзакции из пустого кластера, проверьте исходный код класса Clope!");
        // TODO: Может, добавить хэшсет для ширины кластера, и не перебирать каждый раз весь occ[i],
        // а брать пересечение множеств транзакции и хэшсета
        for (let i = 0; i < transaction.elementKeyCount; i++) {
            if (this.IsElementDeterminative(transaction, i, 1)) {
                wNew--;
            }
        }
        if (this.numTransactions === 1) {
            console.assert(wNew === 0);
            // if (W_new != 0) throw Error("Algo incorrect. w_new must be 0 when only 1 transaction left");
            return this.Grad(this.square, this.numTransactions, this.width)
                - this.Grad(sNew, this.numTransactions - 1, wNew);
        }
        return this.Grad(this.square, this.numTransactions, this.width);
    }
    private Grad(S: number, N: number, width: number): number {
        return S * N / this.mathSupport.GetWPowR(width);
    }
    private IsElementDeterminative(transaction: ITransaction, index: number, threshold: number): boolean {
        const elementKey = transaction.GetElementKey(index);
        return (this.occ[elementKey] === threshold);
        // C такой реализацией в 1.5 раза медленнее
        // return ((this.occ[elementKey] | 0) == threshold)
    }
}
