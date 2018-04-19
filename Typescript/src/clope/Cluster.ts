import { ITransaction } from "./Transaction";
import MathSupport from "./MathSupport";
export interface ICluster<T extends ITransaction> {
    NumberTransactions: number;
    GetOCC(num: number): number;
    AddTransaction(transaction: T): void;
    DelTransaction(transaction: T): void;
    DeltaAdd(transaction: T): number;
    DeltaDel(transaction: T): number;
}

export class Cluster<T extends ITransaction> implements ICluster<T> {
    protected width: number;  //Ширина кластера
    protected square: number; //Площадь кластера
    protected occ: { [key: number]: number; }; //Array<number>;     //Таблица количества объектов по номерам в кластере
    public NumberTransactions: number;
    private mathSupport: MathSupport;

    //public GetOCC = (num: number) => this.occ[num];
    public GetOCC(num: number) { return this.occ[num]; }

    /**
     *
     */
    constructor(capacity: number, mathSupport: MathSupport) {
        this.mathSupport = mathSupport;
        this.occ = new Array<number>(capacity);
        //this.occ = {};
        //for (let i = 0; i < this.occ.length; i++) {
        //    this.occ[i] = 0;
        //}

        this.width = 0;
        this.square = 0;
        this.NumberTransactions = 0;
    }

    protected IsElementDeterminative(transaction: T, index: number, threshold: number): boolean {
        const elementKey = transaction.GetElementKey(index);
        return (this.occ[elementKey] == threshold)
    }

    public AddTransaction(transaction: T): void {
        this.square += transaction.elementKeyCount;
        this.NumberTransactions++;
        for (let i = 0; i < transaction.elementKeyCount; i++) {
            if (this.IsElementDeterminative(transaction, i, 0))
                this.width++;
            let key = transaction.GetElementKey(i);
            //this.occ[key]++;
            this.occ[key] = (this.occ[key] | 0) + 1;
        }
    }

    public DelTransaction(transaction: T): void {
        this.square -= transaction.elementKeyCount;
        this.NumberTransactions--;
        for (let i = 0; i < transaction.elementKeyCount; i++) {
            let key = transaction.GetElementKey(i);
            //console.assert(this.occ[key] > 0);
            this.occ[key]--;
            if (this.IsElementDeterminative(transaction, i, 0))
                this.width--;
        }
    }

    public DeltaAdd(transaction: T): number {
        const S_new = this.square + transaction.elementKeyCount;
        let W_new = this.width;

        //TODO: Может, добавить хэшсет для ширины кластера, и не перебирать каждый раз весь occ[i],
        // а брать пересечение множеств транзакции и хэшсета
        for (let i = 0; i < transaction.elementKeyCount; i++)
            if (this.IsElementDeterminative(transaction, i, 0))
                W_new++;
        if (this.NumberTransactions > 0)
            return this.Grad(S_new, this.NumberTransactions + 1, W_new) - this.Grad(this.square, this.NumberTransactions, this.width);
        return this.Grad(S_new, this.NumberTransactions + 1, W_new);

    }
    public DeltaDel(transaction: T): number {
        let S_new = this.square - transaction.elementKeyCount;
        let W_new = this.width;
        console.assert(this.NumberTransactions >= 1);
        //if (this.NumberTransactions < 1)
        //    throw Error("Попытка удаления транзакции из пустого кластера, проверьте исходный код класса Clope!")
        //TODO: Может, добавить хэшсет для ширины кластера, и не перебирать каждый раз весь occ[i],
        // а брать пересечение множеств транзакции и хэшсета
        for (let i = 0; i < transaction.elementKeyCount; i++)
            if (this.IsElementDeterminative(transaction, i, 1))
                W_new--;
        if (this.NumberTransactions == 1) {
            console.assert(W_new == 0);
            //if (W_new != 0) throw Error("Чертовщина, разбирайся в алгоритме. Удаляет вроде как последнюю транзакцию из кластера, но она не удаляется");
            return this.Grad(this.square, this.NumberTransactions, this.width) - this.Grad(S_new, this.NumberTransactions - 1, W_new);
        }
        return this.Grad(this.square, this.NumberTransactions, this.width);
    }
    protected Grad(S: number, N: number, width: number): number {
        return S * N / this.mathSupport.GetWPowR(width);
    }
}
