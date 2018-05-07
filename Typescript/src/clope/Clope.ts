import { ITransactionStore, Transaction } from "../common/Typings";
import Cluster from "./Cluster";
import MathCache from "./MathCache";

export default class Clope {
    private readonly dataSource: ITransactionStore;
    private readonly mathCache: MathCache;
    private clusters: Cluster[];
    private readonly tableClusters: number[];

    /**
     *
     * @param dataSource Transaction store, must be iterable
     * @param repulsion that coefficient goes straight into MathCache class, needed to calculate profits
     */
    constructor(dataSource: ITransactionStore, repulsion: number) {
        this.dataSource = dataSource;
        this.clusters = [];
        this.tableClusters = [];
        this.mathCache = new MathCache(repulsion);
    }

    /**
     * Consistently calling required steps and returning the result
     * aka clope.main()
     */
    public async Run(): Promise<number[]> {
        await this.Initialize();
        await this.Iterate();

        this.CleanClusters();
        return this.tableClusters;
    }

    /**
     * Phase 1: Initialization
     * We make 1 run over datasource, and put
     * each new transaction to cluster, which gives us best profit.
     * When last cluster is not empty, we create a new one, so we
     * always comparing existing clusters with each other and epmty one.
     * Its a fair competition :)
     */
    private async Initialize(): Promise<void> {
        let iMaxProfitCluster = 0;
        for await (const transaction of this.dataSource) {
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

    /**
     * Phase 2: Iteration
     * Here we try to find best profit by moving clusters, so
     * we repeat datasource runs till we cant move something
     * without decreasing profit
     * During run we temporarily delete given transaction from its cluster
     * and try to find best profit for it again.
     */
    private async Iterate(): Promise<void> {
        let isClusterMoved = true;
        while (isClusterMoved) {
            let rowIndex = 0;
            isClusterMoved = false;
            for await (const transaction of this.dataSource) {
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

    /**
     * Once we're done with relocations, we delete all clusters that became empty
     */
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

    /**
     * Here we run over all existing clusters and counting profit
     * for every one of them. One with maximum profit - the winner.
     * It gets given transaction afterwards
     * Function returns number of winner cluster
     * @param transaction An array of objects' UIDs
     */
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
