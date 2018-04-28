import { ITransactionStoreIterator, Transaction } from "../common/Typings";
import Cluster from "./Cluster";
import MathCache from "./MathCache";

export default class ClopeIterator<T> {
    private readonly dataSource: ITransactionStoreIterator;
    private readonly mathCache: MathCache;
    private clusters: Cluster[];
    private readonly tableClusters: number[];

    constructor(dataSource: ITransactionStoreIterator, repulsion: number) {
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

    private async Initialize(): Promise<void> {
        let iMaxProfitCluster = 0;
        for await (const transaction of this.dataSource.iterator()) {
            if (iMaxProfitCluster >= this.clusters.length - 1) {
                this.clusters.push(new Cluster(this.dataSource.size, this.mathCache));
            }
            iMaxProfitCluster = this.FindMaxProfitCluster(transaction);
            this.clusters[iMaxProfitCluster].Add(transaction);
            this.tableClusters.push(iMaxProfitCluster);
        }

        if (this.clusters[this.clusters.length - 1].isEmpty) {
            this.clusters.pop();
        }
    }

    private async Iterate(): Promise<void> {
        let isClusterMoved = true;
        while (isClusterMoved) {
            let rowIndex = 0;
            isClusterMoved = false;
            for await (const transaction of this.dataSource.iterator()) {
                const iCurrentCluster = this.tableClusters[rowIndex];
                this.clusters[iCurrentCluster].Delete(transaction);

                const iMaxProfitCluster = this.FindMaxProfitCluster(transaction);
                this.clusters[iMaxProfitCluster].Add(transaction);

                if (iMaxProfitCluster !== iCurrentCluster) {
                    this.tableClusters[rowIndex] = iMaxProfitCluster;
                    isClusterMoved = true;
                }
                rowIndex++;
            }
        }
    }

    private CleanClusters(): void {
        for (let i = this.clusters.length - 1 ; i >= 0; i--) {
            if (this.clusters[i].isEmpty) {
                for (let j = 0; j < this.tableClusters.length; j++) {
                    if (this.tableClusters[j] > i) {
                        this.tableClusters[j]--;
                    }
                }
                this.clusters.splice(i, 1);
            }
        }
    }

    private FindMaxProfitCluster(transaction: Transaction): number {
        let maxProfit = 0;
        let iMaxProfitCluster = 0;

        for (let i = 0; i < this.clusters.length; i++) {
            const profit = this.clusters[i].CountDeltaAdd(transaction);
            if (profit > maxProfit) {
                iMaxProfitCluster = i;
                maxProfit = profit;
            }
        }
        return iMaxProfitCluster;
    }
}
