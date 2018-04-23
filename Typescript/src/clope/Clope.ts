import { ITransactionStore } from "../map/TransactionStore";
import Cluster from "./Cluster";
import MathCache from "./MathCache";
import Transaction from "./Transaction";

export default class Clope<T> {
    private readonly dataSource: ITransactionStore;
    private readonly mathCache: MathCache;
    private clusters: Cluster[];
    private readonly tableClusters: number[];

    constructor(dataSource: ITransactionStore, repulsion: number) {
        this.dataSource = dataSource;
        this.clusters = [];
        this.tableClusters = [];
        this.mathCache = new MathCache(repulsion);
    }

    public async Run(): Promise<number[]> {
        await this.Initialize();
        await this.Iterate();

        this.CleanClusters();
        return this.tableClusters;
    }

    private async Initialize() {
        let iMaxProfitCluster = 0;
        // While not EOF, read&process
        await this.dataSource.ReadAll((transaction: Transaction) => {
            if (iMaxProfitCluster >= this.clusters.length - 1) {
                this.clusters.push(this.CreateCluster());
            }
            iMaxProfitCluster = this.CalcProfit(transaction);
            this.clusters[iMaxProfitCluster].Add(transaction);
            this.tableClusters.push(iMaxProfitCluster);
        });
        if (this.clusters[this.clusters.length - 1].isEmpty) {
            this.clusters.pop();
        }
    }

    private CreateCluster() {
        return new Cluster(this.dataSource.size, this.mathCache);
    }

    private async Iterate() {
        let isMoved = true;
        do {
            let rowIndex = 0;
            isMoved = false;
            // While not EOF, read&process
            await this.dataSource.ReadAll((transaction: Transaction) => {

                const iCurrentCluster = this.tableClusters[rowIndex];
                const iMaxProfitCluster = this.CalcProfit(transaction, iCurrentCluster);
                if (iMaxProfitCluster !== iCurrentCluster) {
                    this.clusters[iCurrentCluster].Delete(transaction);
                    this.clusters[iMaxProfitCluster].Add(transaction);
                    this.tableClusters[rowIndex] = iMaxProfitCluster;
                    isMoved = true;
                }
                rowIndex++;
            });
        } while (isMoved);
    }

    private CleanClusters(): void {
        let i = 0;
        while (i < this.clusters.length) {
            if (this.clusters[i].isEmpty) {
                for (let j = 0; j < this.tableClusters.length; j++) {
                    if (this.tableClusters[j] > i) { this.tableClusters[j]--; }
                }
                this.clusters.splice(i, 1);
            } else { i++; }
        }
    }

    private CalcProfit(transaction: Transaction, iCurrentCluster?: number): number {
        // TODO: посмотреть может есть вариант оптимизировать, чтобы не бегать по всему кластерлисту
        if (!iCurrentCluster) { iCurrentCluster = -1; }
        let maxProfit: number;
        let iMaxProfitCluster: number;

        if (iCurrentCluster > 0) {
            maxProfit = this.clusters[iCurrentCluster].CountDeltaDelete(transaction);
            iMaxProfitCluster = iCurrentCluster;
        } else {
            maxProfit = 0;
            iMaxProfitCluster = 0;
        }

        for (let i = 0; i < this.clusters.length; i++) {
            const element = this.clusters[i];
            if (i === iCurrentCluster) { continue; }
            const profit = element.CountDeltaAdd(transaction);
            if (profit <= maxProfit) { continue; }
            iMaxProfitCluster = i;
            maxProfit = profit;
        }
        return iMaxProfitCluster;
    }
}
