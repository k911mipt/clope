import Cluster from "../clope/Cluster";
import Transaction from "../clope/Transaction";
import { ITransactionElement } from "../clope/TransactionElement";
import { IRepository } from "../map/Repository";
import { ITransactionDictionary } from "./TransactionDictionary";

export class Display {
    private repository: IRepository;
    private clusters: Cluster[];
    private tableClusters: number[];
    private classesIDs: ITransactionElement[];
    private group: Array<Map<number, number>>;

    constructor(repository: IRepository, clusters: Cluster[], tableClusters: number[]) {
        this.repository = repository;
        this.clusters = clusters;
        this.tableClusters = tableClusters;

        this.classesIDs = repository.GetClassesIDs();
        this.group = new Array<Map<number, number>>(clusters.length);
        for (let index = 0; index < this.group.length; index++) {
            this.group[index] = new Map<number, number>();
            this.classesIDs.forEach((classElement) => this.group[index].set(classElement.number, 0));
        }
    }
    public async GroupByColumnUniqueElementsAndDisplay(columnNumber: number): Promise<void> {
        this.repository.UpdateRules([columnNumber]);
        const handler = this.TransactionHandler(columnNumber).bind(this);
        await this.repository.ReadUntilEnd(handler);
        this.DisplayClusters();
    }

    private TransactionHandler(columnNumber: number) {
        let index = 0;
        return (transaction: Transaction) => {
            const key = transaction.GetElementKey(columnNumber);
            const clusterNumber = this.tableClusters[index++];
            const val = this.group[clusterNumber].get(key);
            if (val == null) { throw Error("не нашёл значение кол-ва транзакций"); }
            this.group[clusterNumber].set(key, val + 1);
        };
    }

    private DisplayClusters() {
        const sum = new Array<number>(this.classesIDs.length);
        let tempstr = "CLUSTER";
        for (const id of this.classesIDs) {
            tempstr = tempstr + "\t" + id.value;
        }

        // tslint:disable-next-line:no-console
        console.log(tempstr);
        for (let i = 0; i < this.group.length; i++) {
            tempstr = (i + 1).toString();
            for (let j = 0; j < this.classesIDs.length; j++) {
                const val = this.group[i].get(this.classesIDs[j].number);
                if (val == null) { throw new Error("не нашёл значение при выводе"); }
                tempstr += "\t" + val;
                if (sum[j] == null) { sum[j] = 0; }
                sum[j] += val;
            }
            // tslint:disable-next-line:no-console
            console.log(tempstr);
        }
        // tslint:disable-next-line:no-console
        console.log("Total");
        tempstr = "";
        for (let j = 0; j < this.classesIDs.length; j++) {
            tempstr += "\t" + sum[j];
        }
        // tslint:disable-next-line:no-console
        console.log(tempstr);
    }
}
