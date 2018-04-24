import { ITransaction } from "../common/Typings";
import MathCache from "./MathCache";

export default class Cluster {
    private numTransactions: number;
    private width: number;  // Ширина кластера
    private square: number; // Площадь кластера
    private occ: { [key: number]: number; };     // Таблица количества объектов по номерам в кластере
    private mathCache: MathCache;

    constructor(capacity: number, mathCache: MathCache) {
        this.mathCache = mathCache;
        this.occ = [];

        // Без предварительной инициализации алгоритм получается в 1.5 раза медленнее
        for (let i = 0; i < capacity; i++) {
            this.occ[i] = 0;
        }

        this.width = 0;
        this.square = 0;
        this.numTransactions = 0;
    }

    get isEmpty(): boolean {
        return (this.numTransactions === 0);
    }

    public Add(transaction: ITransaction): void {
        this.square += transaction.size;
        this.numTransactions++;
        for (let i = 0; i < transaction.size; i++) {
            if (this.IsUIDisMissing(transaction, i)) {
                this.width++;
            }
            const key = transaction.GetElementUID(i);
            this.occ[key] = (this.occ[key] | 0) + 1;
        }
    }

    public Delete(transaction: ITransaction): void {
        this.square -= transaction.size;
        this.numTransactions--;
        for (let i = 0; i < transaction.size; i++) {
            const key = transaction.GetElementUID(i);
            this.occ[key]--;
            if (this.IsUIDisMissing(transaction, i)) {
                this.width--;
            }
        }
    }

    public CountDeltaAdd(transaction: ITransaction): number {
        if (this.numTransactions === 0) {
            return this.mathCache.Grad(transaction.size, 1, transaction.size);
        }
        const sNew = this.square + transaction.size;
        let wNew = this.width;
        for (let i = 0; i < transaction.size; i++) {
            if (this.IsUIDisMissing(transaction, i)) {
                wNew++;
            }
        }
        return this.mathCache.Grad(sNew, this.numTransactions + 1, wNew)
               - this.mathCache.Grad(this.square, this.numTransactions, this.width);
    }

    private IsUIDisMissing(transaction: ITransaction, index: number): boolean {
        const elementKey = transaction.GetElementUID(index);
        return (this.occ[elementKey] === 0);
    }
}
