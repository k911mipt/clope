import { ICluster } from "../common/types";
import { Transaction } from "./Transaction";

class Cluster implements ICluster {
    private width: number;  //Ширина кластера
    private square: number; //Площадь кластера
    private occ: Array<number>;     //Таблица количества объектов по номерам в кластере
    private numberTransactions: number;
    private mathSupport: MathSupport;

    /**
     *
     */
    constructor(capacity: number, ms: MathSupport) {
        this.mathSupport = ms;
        this.occ = new Array<number>(capacity);
        this.width = 0;
        this.square = 0;
        this.numberTransactions = 0;
    }

    //public AddTransaction(transaction: Transaction)
    public addTransaction(transaction: Transaction): void {
        this.square += transaction.elementKeyCount;
        this.numberTransactions++;
        for (var i = 0; i < transaction.elementKeyCount; i++) {
            if (this.occ[transaction.getElement(i)] == 0)
                this.width++;
            this.occ[transaction.getElement(i)]++;
        }
    }

    public deleteTransaction(transaction: Transaction): void {
        this.square -= transaction.elementKeyCount;
        this.numberTransactions--;
        for (var i = 0; i < transaction.elementKeyCount; i++) {
            this.occ[transaction.getElement(i)]--;
            if (this.occ[transaction.getElement(i)] == 0)
                this.width--;
        }
    }

    public coundDeltaAdd(transaction: Transaction): number {
        const S_new = this.square + transaction.elementKeyCount;
        let W_new = this.width;

        //TODO: Может, добавить хэшсет для ширины кластера, и не перебирать каждый раз весь occ[i],
        // а брать пересечение множеств транзакции и хэшсета
        for (var i = 0; i < transaction.elementKeyCount; i++)
            if (this.occ[transaction.getElement(i)] == 0)
                W_new++;
        if (this.numberTransactions > 0)
            return this.Grad(S_new, this.numberTransactions + 1, W_new) - this.Grad(this.square, this.numberTransactions, this.width);
        return this.Grad(S_new, this.numberTransactions + 1, W_new);

    }
    public countDeltaDel(transaction: Transaction): number {
        let S_new = this.square - transaction.elementKeyCount;
        let W_new = this.width;

        if (this.numberTransactions < 1)
            throw Error("Попытка удаления транзакции из пустого кластера, проверьте исходный код класса Clope!")

        //TODO: Может, добавить хэшсет для ширины кластера, и не перебирать каждый раз весь occ[i],
        // а брать пересечение множеств транзакции и хэшсета        
        for (let i = 0; i < transaction.elementKeyCount; i++)
            if (this.occ[transaction.getElement(i)] == 1)
                W_new--;

        if (this.numberTransactions == 1) {
            if (W_new != 0) throw Error("Чертовщина, разбирайся в алгоритме. Удаляет вроде как последнюю транзакцию из кластера, но она не удаляется");
            return this.Grad(this.square, this.numberTransactions, this.width) - this.Grad(S_new, this.numberTransactions - 1, W_new);
        }

        return this.Grad(this.square, this.numberTransactions, this.width);
    }

    private Grad(S: number, N: number, width: number): number {
        return S * N / this.mathSupport.GetWPowR(width);
    }
}