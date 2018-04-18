import { IRepository } from '../map/Repository';
import { AsyncFileDataSource } from "../db/AsyncFileDataSource";
import { IAsyncDataSource } from '../db/AsyncDataSource';
import { ICluster, Cluster } from './Сluster';
import { ITransaction } from './Transaction';
import MathSupport from './MathSupport';

export class Clope {
    transactionDataSource: IRepository
    public clusters: Array<Cluster>;
    private TableClusters: Array<number>;
    private mathSupport: MathSupport;

    constructor(transactionDataSource: IRepository, repulsion: number) {
        this.transactionDataSource = transactionDataSource;
        this.mathSupport = new MathSupport(repulsion)
        this.clusters = new Array<Cluster>();
        this.TableClusters = new Array<number>();
    }

    private createPhaseHandlerFunc() {
        let iMaxProfitCluster = 0;
        return (transaction: ITransaction) => {
            if (iMaxProfitCluster >= this.clusters.length - 1)
                this.clusters.push(new Cluster(this.transactionDataSource.GetObjectsCount(), this.mathSupport));

            iMaxProfitCluster = this.Profit(transaction);
            this.clusters[iMaxProfitCluster].AddTransaction(transaction);
            this.TableClusters.push(iMaxProfitCluster);
        }
    }

    private createPhase2HandlerFunc(phaseState: { isMoved: boolean }) {
        let j = 0;
        return (transaction: ITransaction) => {
            const iCurrentCluster = this.TableClusters[j];
            const iMaxProfitCluster = this.Profit(transaction, iCurrentCluster);
            if (iMaxProfitCluster != iCurrentCluster) {
                this.clusters[iCurrentCluster].DelTransaction(transaction);
                this.clusters[iMaxProfitCluster].AddTransaction(transaction);
                this.TableClusters[j] = iMaxProfitCluster;
                phaseState.isMoved = true;
            }
            j++;
        }
    }

    private /*async*/ processFirstPhaseAsync(): Promise<void> {
        return this.transactionDataSource.readUntilEnd(this.createPhaseHandlerFunc().bind(this))
            .then(() => {
                if (this.clusters[this.clusters.length - 1].NumberTransactions == 0)
                    this.clusters.pop();
            })
        //Вариант на async await
        // await this.transactionDataSource.readUntilEnd(this.createPhaseHandlerFunc().bind(this))
        // if (this.clusters[this.clusters.length - 1].NumberTransactions == 0)
        //     this.clusters.pop();
    }

    private /*async*/ processSecondPhaseAsync(): Promise<void> {
        let phaseState = {
            isMoved: false
        };
        const startPhase2 = () => this.transactionDataSource.readUntilEnd(this.createPhase2HandlerFunc(phaseState).bind(this));
        // Вариант на промисах
        return startPhase2()
            .then(() => {
                if (phaseState.isMoved) {
                    phaseState.isMoved = false;
                    return this.processSecondPhaseAsync()
                }
                else {
                    this.cleanClusters()
                    return Promise.resolve();
                }
            })
        //Вариант на async await
        // await startPhase2()
        // if (phaseState.isMoved) {
        //     console.log("Started end phase2");
        //     phaseState.isMoved = false;
        //     return await this.processSecondPhaseAsync()
        // }
        // else {
        //     this.cleanClusters()
        //     return Promise.resolve();
        // }
    }

    private cleanClusters() {
        var i = 0;
        while (i < this.clusters.length) {
            if (this.clusters[i].NumberTransactions == 0)        //Если нашли пустой кластер
            {
                for (var j = 0; j < this.TableClusters.length; j++) {
                    if (this.TableClusters[j] > i)   //Уменьшим на 1 номера всех кластеров в таблице, больше пустого
                        this.TableClusters[j]--;
                }
                this.clusters.splice(i, 1)
            }
            else
                i++;
        }
    }

    execute(): Promise<ICluster[]> {
        console.time("prepare " + this.mathSupport.Repulsion.toString());
        return this.transactionDataSource.FullFillObjectsTable()
            .then(() => {
                console.timeEnd("prepare " + this.mathSupport.Repulsion.toString());
                console.time("clope " + this.mathSupport.Repulsion.toString());
            })
            .then(this.processFirstPhaseAsync.bind(this))
            .then(this.processSecondPhaseAsync.bind(this))
            .then((() => this.clusters));
    }

    Profit(transaction: ITransaction, iCurrentCluster?: number) {
        //FIXME: посмотреть вариант оптимизировать, чтобы не бегать по всему кластерлисту
        if (!iCurrentCluster) iCurrentCluster = -1;
        let maxProfit: number;
        let iMaxProfitCluster: number;

        if (iCurrentCluster > 0) {
            maxProfit = this.clusters[iCurrentCluster].DeltaDel(transaction);
            iMaxProfitCluster = iCurrentCluster;
        }
        else {
            maxProfit = 0;
            iMaxProfitCluster = 0;
        }

        for (let i = 0; i < this.clusters.length; i++) {
            const element = this.clusters[i];
            if (i == iCurrentCluster) continue;
            let profit = element.DeltaAdd(transaction);
            if (profit <= maxProfit) continue;
            iMaxProfitCluster = i;
            maxProfit = profit;
        }
        return iMaxProfitCluster;
    }
}


