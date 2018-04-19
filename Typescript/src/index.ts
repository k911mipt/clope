import { AsyncFileDataSource } from "./db/AsyncFileDataSource";
import { RowConverterStringSplit } from "./map/RowConverter";
import { Repository } from "./map/Repository";
import { Clope } from "./clope/Clope";
import { Display } from "./common/Display";

async function main(r: number) {
    const fileSource = new AsyncFileDataSource('../Mushroom_DataSet/agaricus-lepiota.data');
    const rowConverter = new RowConverterStringSplit(",");
    const repo = new Repository(fileSource, rowConverter, ['?'], [0], [0]);
    //const repo = new Repository(fileSource, rowConverter, ['?'], [0], [1]);
    //const repo = new Repository(fileSource, rowConverter, ['?'], [0]);
    //const repo = new Repository(fileSource, rowConverter, ['?']);
    //const repo = new Repository(fileSource, rowConverter, ['?']);
    const clope = new Clope(repo, r);

    const result = await clope.Execute();
    console.timeEnd("clope " + r.toString());
    console.log("finished");
    const display = new Display(repo, result.clusters, result.tableClusters);
    display.GroupByColumnUniqueElementsAndDisplay(0);
}

main(2.7).catch(e => console.error(e));
//main(0.21);
//main(1.7);
// main(0.7);
// main(4.7);
// main(2);

//console.log("test")
