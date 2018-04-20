import { IRepository } from "../map/Repository";
import { Cluster, ICluster } from "./Cluster";
import MathSupport from "./MathSupport";
import { ITransaction } from "./Transaction";

export class Clope {
    private repository: IRepository;
    private clusters: ICluster[];
    private tableClusters: number[];
    private mathSupport: MathSupport;

    constructor(repository: IRepository, repulsion: number) {
        this.repository = repository;
        this.mathSupport = new MathSupport(repulsion);
        this.clusters = new Array<ICluster>();
        this.tableClusters = new Array<number>();
    }
    public async Execute(): Promise<{
        clusters: ICluster[],
        tableClusters: number[],
    }> {
        console.time("prepare " + this.mathSupport.Repulsion.toString());
        await this.repository.FullFillObjectsTable();
        console.timeEnd("prepare " + this.mathSupport.Repulsion.toString());
        console.time("clope " + this.mathSupport.Repulsion.toString());
        await this.InitializeAsync().catch();
        await this.IterateAsync();
        return {
            clusters: this.clusters,
            tableClusters: this.tableClusters,
        };

    }

    private InitializationHandler() {
        let iMaxProfitCluster = 0;
        return (transaction: ITransaction) => {
            if (iMaxProfitCluster >= this.clusters.length - 1) {
                this.clusters.push(new Cluster(this.repository.GetObjectsCount(), this.mathSupport));
            }
            iMaxProfitCluster = this.Profit(transaction);
            this.clusters[iMaxProfitCluster].AddTransaction(transaction);
            this.tableClusters.push(iMaxProfitCluster);
        };
    }

    private IteratonHandler(phaseState: { isMoved: boolean }) {
        let j = 0;
        return (transaction: ITransaction) => {
            const iCurrentCluster = this.tableClusters[j];
            const iMaxProfitCluster = this.Profit(transaction, iCurrentCluster);
            if (iMaxProfitCluster !== iCurrentCluster) {
                this.clusters[iCurrentCluster].DelTransaction(transaction);
                this.clusters[iMaxProfitCluster].AddTransaction(transaction);
                this.tableClusters[j] = iMaxProfitCluster;
                phaseState.isMoved = true;
            }
            j++;
        };
    }

    private async InitializeAsync(): Promise<void> {
        await this.repository.ReadUntilEnd(this.InitializationHandler());
        if (this.clusters[this.clusters.length - 1].numTransactions === 0) {
            this.clusters.pop();
        }
    }

    private async IterateAsync(): Promise<void> {
        const phaseState = {
            isMoved: false,
        };
        await this.repository.ReadUntilEnd(this.IteratonHandler(phaseState));
        if (phaseState.isMoved) {
            phaseState.isMoved = false;
            return this.IterateAsync();
        } else {
            this.CleanClusters();
            return Promise.resolve();
        }
    }

    private CleanClusters(): void {
        let i = 0;
        while (i < this.clusters.length) {
            if (this.clusters[i].numTransactions === 0) {
                for (let j = 0; j < this.tableClusters.length; j++) {
                    if (this.tableClusters[j] > i) { this.tableClusters[j]--; }
                }
                this.clusters.splice(i, 1);
            } else { i++; }
        }
    }

    private Profit(transaction: ITransaction, iCurrentCluster?: number): number {
        // TODO: посмотреть может есть вариант оптимизировать, чтобы не бегать по всему кластерлисту
        if (!iCurrentCluster) { iCurrentCluster = -1; }
        let maxProfit: number;
        let iMaxProfitCluster: number;

        if (iCurrentCluster > 0) {
            maxProfit = this.clusters[iCurrentCluster].DeltaDel(transaction);
            iMaxProfitCluster = iCurrentCluster;
        } else {
            maxProfit = 0;
            iMaxProfitCluster = 0;
        }

        for (let i = 0; i < this.clusters.length; i++) {
            const element = this.clusters[i];
            if (i === iCurrentCluster) { continue; }
            const profit = element.DeltaAdd(transaction);
            if (profit <= maxProfit) { continue; }
            iMaxProfitCluster = i;
            maxProfit = profit;
        }
        return iMaxProfitCluster;
    }
}
