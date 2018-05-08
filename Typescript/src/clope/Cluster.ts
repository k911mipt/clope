import { Transaction } from "../common/Typings";
import MathCache from "./MathCache";

export default class Cluster {
    private numTransactions: number;
    private width: number;
    private square: number;
    private occ: { [uid: number]: number; };
    private mathCache: MathCache;

    /**
     * @param capacity size of transaction store map, number of unique ubjects in dataset
     * @param mathCache simple and handy class, giving gradient function with caching
     */
    constructor(capacity: number, mathCache: MathCache) {
        this.mathCache = mathCache;
        this.occ = [];

        // Without cluster pre-initializations algo would be 1.5 times slower
        for (let i = 0; i < capacity; i++) {
            this.occ[i] = 0;
        }

        this.width = 0;
        this.square = 0;
        this.numTransactions = 0;
    }

    /**
     * Check if cluster is empty
     */
    get isEmpty(): boolean {
        return (this.numTransactions === 0);
    }

    /**
     * Add transaction to cluster
     * @param transaction bunch of object UIDs
     */
    public Add(transaction: Transaction): void {
        this.square += transaction.length;
        this.numTransactions++;
        for (let i = 0; i < transaction.length; i++) {
            if (this.IsUIDisMissing(transaction, i)) {
                this.width++;
            }
            const uid = transaction[i];
            this.occ[uid] = (this.occ[uid] | 0) + 1;
        }
    }

    /**
     * Delete transaction from cluster
     * @param transaction bunch of object UIDs
     */
    public Delete(transaction: Transaction): void {
        this.square -= transaction.length;
        this.numTransactions--;
        for (let i = 0; i < transaction.length; i++) {
            const uid = transaction[i];
            this.occ[uid]--;
            if (this.IsUIDisMissing(transaction, i)) {
                this.width--;
            }
        }
    }

    /**
     * Count profit delta if we put given transaction in this cluster
     * @param transaction bunch of object UIDs
     */
    public CountDeltaAdd(transaction: Transaction): number {
        if (this.numTransactions === 0) {
            return this.mathCache.Grad(transaction.length, 1, transaction.length);
        }

        const sNew = this.square + transaction.length;
        let wNew = this.width;
        for (let i = 0; i < transaction.length; i++) {
            if (this.IsUIDisMissing(transaction, i)) {
                wNew++;
            }
        }

        return this.mathCache.Grad(sNew, this.numTransactions + 1, wNew)
               - this.mathCache.Grad(this.square, this.numTransactions, this.width);
    }

    private IsUIDisMissing(transaction: Transaction, index: number): boolean {
        const uid = transaction[index];
        return ((this.occ[uid] | 0) === 0);
    }
}
