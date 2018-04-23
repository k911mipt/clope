import MathCache from "./MathCache";
import Transaction from "./transaction";

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

    public IsEmpty(): boolean {
        return (this.numTransactions === 0);
    }

    public Add(transaction: Transaction): void {
        this.square += transaction.size;
        this.numTransactions++;
        for (let i = 0; i < transaction.size; i++) {
            if (this.IsElementDeterminative(transaction, i, 0)) {
                this.width++;
            }
            const key = transaction.GetElementKey(i);
            // tslint:disable-next-line:no-bitwise
            this.occ[key] = (this.occ[key] | 0) + 1;
        }
    }

    public Delete(transaction: Transaction): void {
        this.square -= transaction.size;
        this.numTransactions--;
        for (let i = 0; i < transaction.size; i++) {
            const key = transaction.GetElementKey(i);
            // console.assert(this.occ[key] > 0);
            this.occ[key]--;
            if (this.IsElementDeterminative(transaction, i, 0)) {
                this.width--;
            }
        }
    }

    public CountDeltaAdd(transaction: Transaction): number {
        const sNew = this.square + transaction.size;
        let wNew = this.width;

        // TODO: Может, добавить хэшсет для ширины кластера, и не перебирать каждый раз весь occ[i],
        // а брать пересечение множеств транзакции и хэшсета
        for (let i = 0; i < transaction.size; i++) {
            if (this.IsElementDeterminative(transaction, i, 0)) {
                wNew++;
            }
        }
        if (this.numTransactions > 0) {
            return this.mathCache.Grad(sNew, this.numTransactions + 1, wNew)
                - this.mathCache.Grad(this.square, this.numTransactions, this.width);
        }
        return this.mathCache.Grad(sNew, this.numTransactions + 1, wNew);

    }

    public CountDeltaDelete(transaction: Transaction): number {
        const sNew = this.square - transaction.size;
        let wNew = this.width;
        // tslint:disable-next-line:max-line-length
        console.assert(this.numTransactions >= 1, "Попытка удаления транзакции из пустого кластера, проверьте исходный код класса Clope!");
        // TODO: Может, добавить хэшсет для ширины кластера, и не перебирать каждый раз весь occ[i],
        // а брать пересечение множеств транзакции и хэшсета
        for (let i = 0; i < transaction.size; i++) {
            if (this.IsElementDeterminative(transaction, i, 1)) {
                wNew--;
            }
        }
        if (this.numTransactions === 1) {
            console.assert(wNew === 0, "Algo incorrect. w_new must be 0 when only 1 transaction left");
            return this.mathCache.Grad(this.square, this.numTransactions, this.width)
                - this.mathCache.Grad(sNew, this.numTransactions - 1, wNew);
        }
        return this.mathCache.Grad(this.square, this.numTransactions, this.width);
    }

    private IsElementDeterminative(transaction: Transaction, index: number, threshold: number): boolean {
        const elementKey = transaction.GetElementKey(index);
        return (this.occ[elementKey] === threshold);
    }
}
