import { ITransaction } from "./Transaction";
import MathSupport from "./MathSupport";
import { isNullOrUndefined } from "util";

//import { Transaction } from "./Transaction";
export interface ICluster {

}

export class Cluster implements ICluster {
    private width: number;  //Ширина кластера
    private square: number; //Площадь кластера
    private occ: Array<number>;     //Таблица количества объектов по номерам в кластере
    public NumberTransactions: number;
    private mathSupport: MathSupport;

    /**
     *
     */
    constructor(capacity: number, mathSupport: MathSupport) {
        this.mathSupport = mathSupport;
        this.occ = new Array<number>(capacity);
        for (let i = 0; i < this.occ.length; i++) {
            this.occ[i] = 0;
        }

        this.width = 0;
        this.square = 0;
        this.NumberTransactions = 0;
    }

    private check(transaction: ITransaction, i: number, threshold: number): boolean {
        const element = this.occ[transaction.getElement(i)];

        return (element == null || element == threshold)
    }

    //public AddTransaction(transaction: Transaction)
    public AddTransaction(transaction: ITransaction): void {
        this.square += transaction.elementKeyCount;
        this.NumberTransactions++;
        for (var i = 0; i < transaction.elementKeyCount; i++) {
            if (this.occ[transaction.getElement(i)] == 0)
                this.width++;
            this.occ[transaction.getElement(i)]++;
        }
    }

    public DelTransaction(transaction: ITransaction): void {
        this.square -= transaction.elementKeyCount;
        this.NumberTransactions--;
        for (var i = 0; i < transaction.elementKeyCount; i++) {
            this.occ[transaction.getElement(i)]--;
            if (this.occ[transaction.getElement(i)] == 0)
                this.width--;
        }
    }

    public DeltaAdd(transaction: ITransaction): number {
        const S_new = this.square + transaction.elementKeyCount;
        let W_new = this.width;

        //TODO: Может, добавить хэшсет для ширины кластера, и не перебирать каждый раз весь occ[i],
        // а брать пересечение множеств транзакции и хэшсета
        for (var i = 0; i < transaction.elementKeyCount; i++)
            if (this.occ[transaction.getElement(i)] == 0)
                W_new++;
        if (this.NumberTransactions > 0)
            return this.Grad(S_new, this.NumberTransactions + 1, W_new) - this.Grad(this.square, this.NumberTransactions, this.width);
        return this.Grad(S_new, this.NumberTransactions + 1, W_new);

    }
    public DeltaDel(transaction: ITransaction): number {
        let S_new = this.square - transaction.elementKeyCount;
        let W_new = this.width;

        if (this.NumberTransactions < 1)
            throw Error("Попытка удаления транзакции из пустого кластера, проверьте исходный код класса Clope!")

        //TODO: Может, добавить хэшсет для ширины кластера, и не перебирать каждый раз весь occ[i],
        // а брать пересечение множеств транзакции и хэшсета        
        for (let i = 0; i < transaction.elementKeyCount; i++)
            if (this.occ[transaction.getElement(i)] == 1)
                W_new--;

        if (this.NumberTransactions == 1) {
            if (W_new != 0) throw Error("Чертовщина, разбирайся в алгоритме. Удаляет вроде как последнюю транзакцию из кластера, но она не удаляется");
            return this.Grad(this.square, this.NumberTransactions, this.width) - this.Grad(S_new, this.NumberTransactions - 1, W_new);
        }

        return this.Grad(this.square, this.NumberTransactions, this.width);
    }

    private Grad(S: number, N: number, width: number): number {
        return S * N / this.mathSupport.GetWPowR(width);
    }
}