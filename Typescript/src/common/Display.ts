import { IRepository } from "../map/Repository";
import { ITransaction, ITransactionElement, TransactionElement } from "../clope/Transaction";
import { ICluster } from "../clope/Cluster";
import { ITransactionDictionary } from "./TransactionDictionary";

export class Display {
    private repository: IRepository;
    private clusters: Array<ICluster>;
    private tableClusters: Array<number>;
    private classesIDs: Array<ITransactionElement>;
    group: Array<Map<number, number>>;


    constructor(repository: IRepository, clusters: Array<ICluster>, tableClusters: Array<number>) {
        this.repository = repository;
        this.clusters = clusters;
        this.tableClusters = tableClusters;

        this.classesIDs = repository.GetClassesIDs();
        this.group = new Array<Map<number, number>>(clusters.length)
        for (let index = 0; index < this.group.length; index++) {
            this.group[index] = new Map<number, number>();
            this.classesIDs.forEach(classElement => this.group[index].set(classElement.NumberAttribute, 0))
        }
    }

    private TransactionHandler(columnNumber: number) {
        let index = 0;
        return (transaction: ITransaction) => {
            const key = transaction.GetElementKey(columnNumber);
            const clusterNumber = this.tableClusters[index++];
            const val = this.group[clusterNumber].get(key);
            if (val == null) throw Error("не нашёл значение кол-ва транзакций");
            this.group[clusterNumber].set(key, val + 1)
        }
    }
    public GroupByColumnUniqueElementsAndDisplay(columnNumber: number): Promise<void> {
        this.repository.UpdateSkipRules([columnNumber]);
        const handler = this.TransactionHandler(columnNumber).bind(this);
        return this.repository.ReadUntilEnd(handler)
            .then(this.DisplayClusters.bind(this));
    }
    DisplayClusters() {
        let sum = new Array<number>(this.classesIDs.length);
        let tempstr = "CLUSTER";
        for (let i = 0; i < this.classesIDs.length; i++)
            tempstr = tempstr + "\t" + this.classesIDs[i].AttributeValue;
        console.log(tempstr);
        for (let i = 0; i < this.group.length; i++) {
            tempstr = (i + 1).toString();
            for (let j = 0; j < this.classesIDs.length; j++) {
                const val = this.group[i].get(this.classesIDs[j].NumberAttribute);
                if (val == null) throw new Error("не нашёл значение при выводе");
                tempstr += "\t" + val;
                if (sum[j] == null) sum[j] = 0;
                sum[j] += val;
            }
            console.log(tempstr);
        }
        console.log("Total");
        tempstr = "";
        for (let j = 0; j < this.classesIDs.length; j++)
            tempstr += "\t" + sum[j];
        console.log(tempstr);
    }
}