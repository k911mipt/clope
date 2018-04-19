import { ICluster } from './Сluster';
import { ITransaction, ITransactionWithMissedClusters } from "./Transaction";
import MathSupport from "./MathSupport";
export interface ICluster<T extends ITransaction> {
    NumberTransactions: number;
    //constructor(capacity: number, mathSupport: MathSupport);
    //new(): ICluster;
    getOCC(num: number): number;
    AddTransaction(transaction: T): void;
    DelTransaction(transaction: T): void;
    DeltaAdd(transaction: T): number;
    DeltaDel(transaction: T): number;
}

export class Cluster<T extends ITransaction> implements ICluster<ITransaction> {
    protected width: number;  //Ширина кластера
    protected square: number; //Площадь кластера
    protected occ: Array<number>;     //Таблица количества объектов по номерам в кластере
    public NumberTransactions: number;
    private mathSupport: MathSupport;

    public getOCC = (num: number) => this.occ[num];

    /**
     *
     */
    constructor(capacity: number, mathSupport: MathSupport) {
        //console.log("created old");
        this.mathSupport = mathSupport;
        this.occ = new Array<number>(capacity);
        for (let i = 0; i < this.occ.length; i++) {
            this.occ[i] = 0;
        }

        this.width = 0;
        this.square = 0;
        this.NumberTransactions = 0;
    }

    protected isElementDeterminative(transaction: T, index: number, threshold: number): boolean {
        const elementKey = transaction.getElementKey(index);
        return (this.occ[elementKey] == threshold)
    }

    public AddTransaction(transaction: T): void {
        this.square += transaction.elementKeyCount;
        this.NumberTransactions++;
        for (var i = 0; i < transaction.elementKeyCount; i++) {
            if (this.isElementDeterminative(transaction, i, 0))
                this.width++;
            this.occ[transaction.getElementKey(i)]++;
        }
    }

    public DelTransaction(transaction: T): void {
        this.square -= transaction.elementKeyCount;
        this.NumberTransactions--;
        for (var i = 0; i < transaction.elementKeyCount; i++) {
            this.occ[transaction.getElementKey(i)]--;
            if (this.isElementDeterminative(transaction, i, 0))
                this.width--;
        }
    }

    public DeltaAdd(transaction: T): number {
        const S_new = this.square + transaction.elementKeyCount;
        let W_new = this.width;

        //TODO: Может, добавить хэшсет для ширины кластера, и не перебирать каждый раз весь occ[i],
        // а брать пересечение множеств транзакции и хэшсета
        for (var i = 0; i < transaction.elementKeyCount; i++)
            if (this.isElementDeterminative(transaction, i, 0))
                W_new++;
        if (this.NumberTransactions > 0)
            return this.Grad(S_new, this.NumberTransactions + 1, W_new) - this.Grad(this.square, this.NumberTransactions, this.width);
        return this.Grad(S_new, this.NumberTransactions + 1, W_new);

    }
    public DeltaDel(transaction: T): number {
        let S_new = this.square - transaction.elementKeyCount;
        let W_new = this.width;
        if (this.NumberTransactions < 1)
            throw Error("Попытка удаления транзакции из пустого кластера, проверьте исходный код класса Clope!")
        //TODO: Может, добавить хэшсет для ширины кластера, и не перебирать каждый раз весь occ[i],
        // а брать пересечение множеств транзакции и хэшсета        
        for (let i = 0; i < transaction.elementKeyCount; i++)
            if (this.isElementDeterminative(transaction, i, 1))
                W_new--;
        if (this.NumberTransactions == 1) {
            if (W_new != 0) throw Error("Чертовщина, разбирайся в алгоритме. Удаляет вроде как последнюю транзакцию из кластера, но она не удаляется");
            return this.Grad(this.square, this.NumberTransactions, this.width) - this.Grad(S_new, this.NumberTransactions - 1, W_new);
        }
        return this.Grad(this.square, this.NumberTransactions, this.width);
    }
    protected Grad(S: number, N: number, width: number): number {
        return S * N / this.mathSupport.GetWPowR(width);
    }
}
export class ClusterWithMissedClusters<T extends ITransactionWithMissedClusters> extends Cluster<T> {
    /**
     *
     */
    constructor(capacity: number, mathSupport: MathSupport) {
        super(capacity, mathSupport);
        //console.log("created new");
    }
    protected isElementDeterminative(transaction: T, index: number, threshold: number): boolean {
        const elementKey = transaction.getElementKey(index);
        return (!transaction.getElementKeyStatus(index)) && (this.occ[elementKey] == threshold)
    }
    // private isMissed(transaction: T, index: number): boolean {
    //     return transaction.getElementKeyStatus(index);
    // }

    // public AddTransaction(transaction: ITransactionWithMissedClusters): void {
    //     this.square += transaction.elementKeyCount;
    //     this.NumberTransactions++;
    //     for (var i = 0; i < transaction.elementKeyCount; i++) {
    //         const elementKey = transaction.getElementKey(i);
    //         if (!this.isMissed(transaction, i))
    //             if (this.occ[elementKey] == 0)
    //                 this.width++;
    //         this.occ[elementKey]++;
    //     }
    // }

    // public DelTransaction(transaction: ITransactionWithMissedClusters): void {
    //     this.square -= transaction.elementKeyCount;
    //     this.NumberTransactions--;
    //     for (var i = 0; i < transaction.elementKeyCount; i++) {
    //         const elementKey = transaction.getElementKey(i);
    //         this.occ[elementKey]--;
    //         if (!this.isMissed(transaction, i))
    //             if (this.occ[elementKey] == 0)
    //                 this.width--;
    //     }
    // }

    // public DeltaAdd(transaction: ITransactionWithMissedClusters): number {
    //     const S_new = this.square + transaction.elementKeyCount;
    //     let W_new = this.width;

    //     //TODO: Может, добавить хэшсет для ширины кластера, и не перебирать каждый раз весь occ[i],
    //     // а брать пересечение множеств транзакции и хэшсета
    //     for (var i = 0; i < transaction.elementKeyCount; i++)
    //         if (!this.isMissed(transaction, i))
    //             if (this.occ[transaction.getElementKey(i)] == 0)
    //                 W_new++;
    //     if (this.NumberTransactions > 0)
    //         return this.Grad(S_new, this.NumberTransactions + 1, W_new) - this.Grad(this.square, this.NumberTransactions, this.width);
    //     return this.Grad(S_new, this.NumberTransactions + 1, W_new);

    // }
    // public DeltaDel(transaction: ITransactionWithMissedClusters): number {
    //     let S_new = this.square - transaction.elementKeyCount;
    //     let W_new = this.width;
    //     if (this.NumberTransactions < 1)
    //         throw Error("Попытка удаления транзакции из пустого кластера, проверьте исходный код класса Clope!")
    //     //TODO: Может, добавить хэшсет для ширины кластера, и не перебирать каждый раз весь occ[i],
    //     // а брать пересечение множеств транзакции и хэшсета        
    //     for (let i = 0; i < transaction.elementKeyCount; i++)
    //         if (!this.isMissed(transaction, i))
    //             if (this.occ[transaction.getElementKey(i)] == 1)
    //                 W_new--;
    //     if (this.NumberTransactions == 1) {
    //         if (W_new != 0) throw Error("Чертовщина, разбирайся в алгоритме. Удаляет вроде как последнюю транзакцию из кластера, но она не удаляется");
    //         return this.Grad(this.square, this.NumberTransactions, this.width) - this.Grad(S_new, this.NumberTransactions - 1, W_new);
    //     }
    //     return this.Grad(this.square, this.NumberTransactions, this.width);
    // }
}