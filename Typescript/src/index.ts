import Clope from "./clope/Clope";
import { FileDataSource } from "./db/DataSource";
import RuleSet from "./map/RuleSet";
import { TransactionStore } from "./map/TransactionStore";

async function AlgoRun(r: number) {
    const fileSource = new FileDataSource("../Mushroom_DataSet/agaricus-lepiota.data");

    const ruleSet = new RuleSet<string>({
        convertFunc: (row: string) => row.split(","),
        indexToSkip: [0],
        nullElements: ["?"],
    });

    const transactionStore = new TransactionStore<string>(fileSource, ruleSet);

    const clope = new Clope<string>(transactionStore, r);

    return clope.Run();
}

async function main() {
    console.time("clope");
    await AlgoRun(2.7);
    // console.log()
    console.timeEnd("clope");
}

main();
