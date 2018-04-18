import { ITransactionStore } from '../map/Repository';
import { AsyncFileDataSource } from "../db/AsyncFileDataSource";
import { IAsyncDataSource } from '../db/AsyncDataSource';
import { ICluster, Cluster } from './Сluster';
import { ITransaction } from './Transaction';
import MathSupport from './MathSupport';

export class Clope {
    transactionDataSource: ITransactionStore
    public _clusterList: Array<Cluster>;
    private TableClusters: Array<number>;
    private mathSupport: MathSupport;

    constructor(transactionDataSource: ITransactionStore, repulsion: number) {
        this.transactionDataSource = transactionDataSource;
        this.mathSupport = new MathSupport(repulsion)
        this._clusterList = new Array<Cluster>();
        this.TableClusters = new Array<number>();
    }

    private createPhaseHandlerFunc() {
        let iMaxProfitCluster = 0;
        return (transaction: ITransaction) => {
            if (iMaxProfitCluster >= this._clusterList.length - 1)
                this._clusterList.push(new Cluster(this.transactionDataSource.GetObjectsCount(), this.mathSupport));

            iMaxProfitCluster = this.Profit(transaction);
            this._clusterList[iMaxProfitCluster].AddTransaction(transaction);
            this.TableClusters.push(iMaxProfitCluster);
        }
    }

    private createPhase2HandlerFunc(phaseState: { isMoved: boolean }) {
        let j = 0;
        return (transaction: ITransaction) => {
            const iCurrentCluster = this.TableClusters[j];
            const iMaxProfitCluster = this.Profit(transaction, iCurrentCluster);
            if (iMaxProfitCluster != iCurrentCluster) {
                this._clusterList[iCurrentCluster].DelTransaction(transaction);
                this._clusterList[iMaxProfitCluster].AddTransaction(transaction);
                this.TableClusters[j] = iMaxProfitCluster;
                phaseState.isMoved = true;
            }
            j++;
        }
    }

    //try to find a better name 
    private async processFirstPhaseAsync(): Promise<void> {
        // return this.transactionDataSource.readUntilEnd(this.createPhaseHandlerFunc().bind(this))
        //     .then(() => {
        //         if (this._clusterList[this._clusterList.length - 1].NumberTransactions == 0)
        //             this._clusterList.pop();
        //     })

        await this.transactionDataSource.readUntilEnd(this.createPhaseHandlerFunc().bind(this))
        if (this._clusterList[this._clusterList.length - 1].NumberTransactions == 0)
            this._clusterList.pop();
    }

    private async processSecondPhaseAsync(): Promise<void> {
        let phaseState = {
            isMoved: false
        };
        const startPhase2 = () => this.transactionDataSource.readUntilEnd(this.createPhase2HandlerFunc(phaseState).bind(this));
        console.log("Started phase2");
        // return startPhase2()
        //     .then(() => {
        //         if (phaseState.isMoved) {
        //             console.log("Started end phase2");
        //             phaseState.isMoved = false;
        //             return this.processSecondPhaseAsync()
        //         }
        //         else {
        //             this.cleanClusters()
        //             return Promise.resolve();
        //         }
        //     })

        await startPhase2()
        if (phaseState.isMoved) {
            console.log("Started end phase2");
            phaseState.isMoved = false;
            return await this.processSecondPhaseAsync()
        }
        else {
            this.cleanClusters()
            return Promise.resolve();
        }
    }

    private cleanClusters() {
        var i = 0;
        while (i < this._clusterList.length) {
            if (this._clusterList[i].NumberTransactions == 0)        //Если нашли пустой кластер
            {
                for (var j = 0; j < this.TableClusters.length; j++) {
                    if (this.TableClusters[j] > i)   //Уменьшим на 1 номера всех кластеров в таблице, больше пустого
                        this.TableClusters[j]--;
                }
                this._clusterList.splice(i, 1)
            }
            else
                i++;
        }
    }

    execute(): Promise<ICluster[]> {
        return this.transactionDataSource.FullFillObjectsTable()
            .then(this.processFirstPhaseAsync.bind(this))
            .then(this.processSecondPhaseAsync.bind(this))
            .then((() => this._clusterList));
    }

    Profit(transaction: ITransaction, iCurrentCluster?: number) {
        //FIXME: посмотреть вариант оптимизировать, чтобы не бегать по всему кластерлисту
        if (!iCurrentCluster) iCurrentCluster = -1;
        let maxProfit: number;
        let iMaxProfitCluster: number;

        if (iCurrentCluster > 0) {
            maxProfit = this._clusterList[iCurrentCluster].DeltaDel(transaction);
            iMaxProfitCluster = iCurrentCluster;
        }
        else {
            maxProfit = 0;
            iMaxProfitCluster = 0;
        }

        for (let i = 0; i < this._clusterList.length; i++) {
            const element = this._clusterList[i];
            if (i == iCurrentCluster) continue;
            let profit = element.DeltaAdd(transaction);
            if (profit <= maxProfit) continue;
            iMaxProfitCluster = i;
            maxProfit = profit;
        }
        return iMaxProfitCluster;
    }
}


