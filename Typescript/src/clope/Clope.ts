import { ITransaction, ITransactionStore } from "../common/Typings";
import Cluster from "./Cluster";
import MathCache from "./MathCache";

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
        await this.dataSource.ReadAll((transaction: ITransaction) => {
            if (iMaxProfitCluster >= this.clusters.length - 1) {
                this.clusters.push(this.CreateCluster());
            }
            iMaxProfitCluster = this.FindMaxProfitCluster(transaction);
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
            await this.dataSource.ReadAll((transaction: ITransaction) => {

                const iCurrentCluster = this.tableClusters[rowIndex];
                this.clusters[iCurrentCluster].Delete(transaction);

                const iMaxProfitCluster = this.FindMaxProfitCluster(transaction);
                this.clusters[iMaxProfitCluster].Add(transaction);

                if (iMaxProfitCluster !== iCurrentCluster) {
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
            if (!this.clusters[i].isEmpty) {
                i++;
                continue;
            }
            for (let j = 0; j < this.tableClusters.length; j++) {
                if (this.tableClusters[j] > i) { this.tableClusters[j]--; }
            }
            this.clusters.splice(i, 1);
        }
    }

    private FindMaxProfitCluster(transaction: ITransaction): number {
        let maxProfit = 0;
        let iMaxProfitCluster = 0;

        for (let i = 0; i < this.clusters.length; i++) {
            const profit = this.clusters[i].CountDeltaAdd(transaction);
            if (profit <= maxProfit) { continue; }
            iMaxProfitCluster = i;
            maxProfit = profit;
        }
        return iMaxProfitCluster;
    }
}
