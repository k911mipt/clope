import { Transaction } from './../db/Transaction';
import { ICluster } from './../common/types';
class Cluster implements ICluster {
    private width: number = 0;  //Ширина кластера
    private square: number = 0; //Площадь кластера
    public readonly occ: number[]; //Таблица количества объектов по номерам в кластере
    public readonly numberTransactions: number = 0;
    private mathSupport: MathSupport;

    /**
     *
     */
    constructor(capacity: number, ms: MathSupport) {
        this.mathSupport = ms;
        this.occ = new Array<number>(capacity);
    }

    public AddTransaction(transaction: Transaction)


}