import Clope from "./clope/Clope";
import RuleSet from "./clope/RuleSet";
import TransactionStoreIterator from "./clope/TransactionStore";
import Display from "./common/Display";
import FileDataSource from "./db/FileDataSource";

// import fs from "fs";
// import ReadLine from "readline";

async function main(repulsion: number, filePath: string) {
    const fileSource = new FileDataSource(filePath);
    const ruleSet = new RuleSet<string>({
        ConvertFunc: (row: string) => row.split(","),
        columnsToSkip: [0],
        nullElements: ["?"],
    });
    const transactionStore = new TransactionStoreIterator<string>(fileSource, ruleSet);
    const clope = new Clope(transactionStore, repulsion);

    console.time("init iterator");
    await transactionStore.InitStore();
    console.timeEnd("init iterator");

    console.time("clope iterator");
    const tableClusters = await clope.Run();
    console.timeEnd("clope iterator");

    // Display grouped clusters
    ruleSet.Update({
        ConvertFunc: (row: string) => row.split(","),
        columnsToSkip: [],
        nullElements: ["?"],
    });
    const displayIterator = new Display(0, transactionStore, tableClusters);
    await displayIterator.Out();
}

main(2.7, "../Mushroom_DataSet/agaricus-lepiota.data").catch((e) => console.error(e + " Catched"));
