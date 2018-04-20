import { Clope } from "./clope/Clope";
import { Display } from "./common/Display";
import { FileDataSourceAsync } from "./db/FileDataSourceAsync";
import { Repository } from "./map/Repository";
import { RowConverterStringSplit } from "./map/RowConverter";

async function main(r: number) {
    const fileSource = new FileDataSourceAsync("../Mushroom_DataSet/agaricus-lepiota.data");
    const rowConverter = new RowConverterStringSplit(",");
    const nullElements = new Set("?");
    const clusterColumns = new Set<number>();
    clusterColumns.add(0);
    const missedColumns = new Set<number>();
    missedColumns.add(0);

    const repo = new Repository(fileSource, rowConverter, nullElements, clusterColumns, missedColumns);
    // const repo = new Repository(fileSource, rowConverter,['?'], [0], [1]);
    // const repo = new Repository(fileSource, rowConverter, ['?'], [0]);
    // const repo = new Repository(fileSource, rowConverter, ['?']);
    // const repo = new Repository(fileSource, rowConverter, ['?']);
    const clope = new Clope(repo, r);

    const result = await clope.Execute();
    console.timeEnd("clope " + r.toString());
    console.log("finished");
    const display = new Display(repo, result.clusters, result.tableClusters);
    display.GroupByColumnUniqueElementsAndDisplay(0);
}
console.profile();
main(2.7).catch((e) => console.error(e));
console.profileEnd();
// main(0.21);
// main(1.7);
// main(0.7);
// main(4.7);
// main(2);

// console.log("test")
