import { isNullOrUndefined } from "util";
import { ITransactionStore, TransactionElement, UID } from "./Typings";

export default class Display {
    private dataSource: ITransactionStore;
    private tableClusters: number[];
    private classesIDs: [TransactionElement, UID][];
    private clusterOccurences: Map<UID, number>[];
    private columnNumber: number;

    /**
     * @param columnNumber number of column in data to take classes names
     * @param dataSource Source of transactions
     * @param tableClusters result of clope algorithm
     */
    constructor(columnNumber: number, dataSource: ITransactionStore, tableClusters: number[]) {
        this.dataSource = dataSource;
        this.tableClusters = tableClusters;
        this.columnNumber = columnNumber;

        this.classesIDs = dataSource.GetClassesIDs(columnNumber);
        this.clusterOccurences = new Array<Map<UID, number>>();
    }

    /**
     * Displaying grouped cluster table in console
     */
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
        for await (const transaction of this.dataSource) {
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
        }
    }
}
