import Clope from "./clope/Clope";
import ClopeIterator from "./clope/ClopeIterator";
import RuleSet from "./clope/RuleSet";
import TransactionStore from "./clope/TransactionStore";
import TransactionStoreIterator from "./clope/TransactionStoreIterator";
import Display from "./common/Display";
import DisplayIterator from "./common/DisplayIterator";
import FileDataSource from "./db/FileDataSource";
import FileDataSourceIterator from "./db/FileDataSourceIterator";
// import fs from "fs";
// import ReadLine from "readline";

async function main(repulsion: number, filePath: string) {
    const fileSource = new FileDataSource(filePath);
    const ruleSet = new RuleSet<string>({
        ConvertFunc: (row: string) => row.split(","),
        columnsToSkip: [0],
        nullElements: ["?"],
    });
    const transactionStore = new TransactionStore<string>(fileSource, ruleSet);
    const clope = new Clope<string>(transactionStore, repulsion);

    console.time("init");
    await transactionStore.InitStore();
    console.timeEnd("init");

    console.time("clope");
    const tableClusters = await clope.Run();
    console.timeEnd("clope");

    // Display grouped clusters
    ruleSet.Update({
        ConvertFunc: (row: string) => row.split(","),
        columnsToSkip: [],
        nullElements: ["?"],
    });
    const display = new Display(0, transactionStore, tableClusters);
    await display.Out();
}

async function mainIterator(repulsion: number, filePath: string) {
    const fileSourceIterator = new FileDataSourceIterator(filePath);
    const ruleSet = new RuleSet<string>({
        ConvertFunc: (row: string) => row.split(","),
        columnsToSkip: [0],
        nullElements: ["?"],
    });
    const transactionStoreIterator = new TransactionStoreIterator<string>(fileSourceIterator, ruleSet);
    const clopeIterator = new ClopeIterator<string>(transactionStoreIterator, repulsion);

    console.time("init");
    await transactionStoreIterator.InitStore();
    console.timeEnd("init");

    console.time("clope");
    const tableClusters = await clopeIterator.Run();
    console.timeEnd("clope");

    // Display grouped clusters
    ruleSet.Update({
        ConvertFunc: (row: string) => row.split(","),
        columnsToSkip: [],
        nullElements: ["?"],
    });
    const displayIterator = new DisplayIterator(0, transactionStoreIterator, tableClusters);
    await displayIterator.Out();
}

async function temp() {
    const filePath = "../Mushroom_DataSet/tempFile.txt";
    const repulsion = 2.7;
    const fileSourceIterator = new FileDataSourceIterator(filePath);
    const ruleSet = new RuleSet<string>({
        ConvertFunc: (row: string) => row.split(","),
        columnsToSkip: [0],
        nullElements: ["?"],
    });
    const transactionStoreIterator = new TransactionStoreIterator<string>(fileSourceIterator, ruleSet);
    const clopeIterator = new ClopeIterator<string>(transactionStoreIterator, repulsion);

    console.time("init");
    await transactionStoreIterator.InitStore();
    console.timeEnd("init");

    for await (const transaction of transactionStoreIterator.iterator()) {
        console.log(transaction);
    }

}
// temp();
// main(2.7, "../Mushroom_DataSet/agaricus-lepiota.data").catch((e) => console.error(e + " Catched"));
mainIterator(2.7, "../Mushroom_DataSet/agaricus-lepiota.data").catch((e) => console.error(e + " Catched"));
