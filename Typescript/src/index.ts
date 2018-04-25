import Clope from "./clope/Clope";
import RuleSet from "./clope/RuleSet";
import TransactionStore from "./clope/TransactionStore";
import Display from "./common/Display";
import FileDataSource from "./db/FileDataSource";

async function main(repulsion: number) {
    const fileSource = new FileDataSource("../Mushroom_DataSet/agaricus-lepiota.data");
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

main(2.7).catch((e) => console.error(e + " Catched"));
