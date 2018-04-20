import MathSupport from "./MathSupport";
import Transaction from "./Transaction";
export default class Cluster {
    private numTransactions: number;
    private width: number;  // Ширина кластера
    private square: number; // Площадь кластера
    private occ: { [key: number]: number; };     // Таблица количества объектов по номерам в кластере
    private mathSupport: MathSupport;

    constructor(capacity: number, mathSupport: MathSupport) {
        this.mathSupport = mathSupport;
        this.occ = [];

        // Без предварительной инициализации алгоритм получается в 1.5 раза медленнее
        for (let i = 0; i < capacity; i++) {
            this.occ[i] = 0;
        }

        this.width = 0;
        this.square = 0;
        this.numTransactions = 0;
    }

    public GetOCC(num: number): number {
        return this.occ[num];
    }

    public IsEmpty(): boolean {
        return (this.numTransactions === 0);
    }

    public AddTransaction(transaction: Transaction): void {
        this.square += transaction.Length();
        this.numTransactions++;
        for (let i = 0; i < transaction.Length(); i++) {
            if (this.IsElementDeterminative(transaction, i, 0)) {
                this.width++;
            }
            const key = transaction.GetElementKey(i);
            // tslint:disable-next-line:no-bitwise
            this.occ[key] = (this.occ[key] | 0) + 1;
        }
    }

    public DelTransaction(transaction: Transaction): void {
        this.square -= transaction.Length();
        this.numTransactions--;
        for (let i = 0; i < transaction.Length(); i++) {
            const key = transaction.GetElementKey(i);
            // console.assert(this.occ[key] > 0);
            this.occ[key]--;
            if (this.IsElementDeterminative(transaction, i, 0)) {
                this.width--;
            }
        }
    }

    public DeltaAdd(transaction: Transaction): number {
        const sNew = this.square + transaction.Length();
        let wNew = this.width;

        // TODO: Может, добавить хэшсет для ширины кластера, и не перебирать каждый раз весь occ[i],
        // а брать пересечение множеств транзакции и хэшсета
        for (let i = 0; i < transaction.Length(); i++) {
            if (this.IsElementDeterminative(transaction, i, 0)) {
                wNew++;
            }
        }
        if (this.numTransactions > 0) {
            return this.mathSupport.Grad(sNew, this.numTransactions + 1, wNew)
                - this.mathSupport.Grad(this.square, this.numTransactions, this.width);
        }
        return this.mathSupport.Grad(sNew, this.numTransactions + 1, wNew);

    }

    public DeltaDel(transaction: Transaction): number {
        const sNew = this.square - transaction.Length();
        let wNew = this.width;
        // tslint:disable-next-line:max-line-length
        console.assert(this.numTransactions >= 1, "Попытка удаления транзакции из пустого кластера, проверьте исходный код класса Clope!");
        // TODO: Может, добавить хэшсет для ширины кластера, и не перебирать каждый раз весь occ[i],
        // а брать пересечение множеств транзакции и хэшсета
        for (let i = 0; i < transaction.Length(); i++) {
            if (this.IsElementDeterminative(transaction, i, 1)) {
                wNew--;
            }
        }
        if (this.numTransactions === 1) {
            console.assert(wNew === 0, "Algo incorrect. w_new must be 0 when only 1 transaction left");
            return this.mathSupport.Grad(this.square, this.numTransactions, this.width)
                - this.mathSupport.Grad(sNew, this.numTransactions - 1, wNew);
        }
        return this.mathSupport.Grad(this.square, this.numTransactions, this.width);
    }

    private IsElementDeterminative(transaction: Transaction, index: number, threshold: number): boolean {
        const elementKey = transaction.GetElementKey(index);
        return (this.occ[elementKey] === threshold);
    }
}
