import { isNullOrUndefined } from "util";
import Cluster from "../clope/Cluster";
import { ITransactionStore, Transaction, TransactionElement, UID } from "./Typings";

export default class Display {
    private dataSource: ITransactionStore;
    private tableClusters: number[];
    private classesIDs: Array<[TransactionElement, UID]>;
    private clusterOccurences: Array<Map<UID, number>>;
    private columnNumber: number;

    constructor(columnNumber: number, dataSource: ITransactionStore, tableClusters: number[]) {
        this.dataSource = dataSource;
        this.tableClusters = tableClusters;
        this.columnNumber = columnNumber;

        this.classesIDs = dataSource.GetClassesIDs(columnNumber);
        this.clusterOccurences = new Array<Map<UID, number>>();
    }

    public async Out(): Promise<void> {
        await this.GroupBy();

        const sum = new Array<number>(this.classesIDs.length);
        let tempstr = "CLUSTER";
        for (const id of this.classesIDs) {
            tempstr = tempstr + "\t" + id["0"];
        }

        console.log(tempstr);
        for (let i = 0; i < this.clusterOccurences.length; i++) {
            tempstr = (i + 1).toString();
            for (let j = 0; j < this.classesIDs.length; j++) {
                const val = this.clusterOccurences[i].get(this.classesIDs[j]["1"]);
                if (val == null) { throw new Error("Couldnt find value to output"); }
                tempstr += "\t" + val;
                if (sum[j] == null) { sum[j] = 0; }
                sum[j] += val;
            }
            console.log(tempstr);
        }
        console.log("Total");
        tempstr = "";
        for (let j = 0; j < this.classesIDs.length; j++) {
            tempstr += "\t" + sum[j];
        }
        console.log(tempstr);
    }

    private async GroupBy(): Promise<void> {
        let rowNumber = 0;
        await this.dataSource.ReadAll((transaction: Transaction) => {
            const uid = transaction[this.columnNumber];
            const clusterNumber = this.tableClusters[rowNumber++];
            if (clusterNumber >= this.clusterOccurences.length) {
                for (let i = this.clusterOccurences.length; i <= clusterNumber; i++) {
                    this.clusterOccurences[i] = new Map<UID, number>();
                    this.classesIDs.forEach((classElement) => this.clusterOccurences[i].set(classElement["1"], 0));
                }
            }
            const val = this.clusterOccurences[clusterNumber].get(uid);
            if (!isNullOrUndefined(val)) { this.clusterOccurences[clusterNumber].set(uid, val + 1); }
        });
    }
}
