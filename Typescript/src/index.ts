// Must have global polyfill to use async generators
// due to https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-3.html
(Symbol as any).asyncIterator = Symbol.asyncIterator || Symbol.iterator || Symbol.for("Symbol.asyncIterator");

import Clope from "./clope/Clope";
import RuleSet from "./clope/RuleSet";
import TransactionStore from "./clope/TransactionStore";
import Display from "./common/Display";
import FileDataSource from "./db/FileDataSource";

async function main(repulsion: number, filePath: string) {
    const fileSource = new FileDataSource(filePath);
    const ruleSet = new RuleSet<string>({
        ConvertFunc: (row: string) => row.split(","),
        columnsToSkip: [0],
        nullElements: ["?"],
    });
    const transactionStore = new TransactionStore<string>(fileSource, ruleSet);
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
