import { Display } from './common/Display';
import { TransactionElement } from './clope/Transaction';
import { AsyncFileDataSource } from "./db/AsyncFileDataSource";
import { RowConverterStringSplit } from "./map/RowConverter";
import { Repository } from "./map/Repository";
import { Clope } from "./clope/Clope";

function DisplayClusters(clope: Clope, repo: Repository<string>) {
    const classes = repo.GetClassesIDs();
    let sum = new Array<number>(classes.length);
    let tempstr = "CLUSTER";
    for (let i = 0; i < classes.length; i++)
        tempstr = tempstr + "\t" + classes[i].AttributeValue;
    console.log(tempstr);
    for (let i = 0; i < clope.clusters.length; i++) {
        tempstr = (i + 1).toString();
        for (let j = 0; j < classes.length; j++) {
            tempstr += "\t" + clope.clusters[i].GetOCC(classes[j].NumberAttribute);
            if (sum[j] == null) sum[j] = 0;
            sum[j] += clope.clusters[i].GetOCC(classes[j].NumberAttribute);
        }
        console.log(tempstr);
    }
    console.log("Total");
    tempstr = "";
    for (let j = 0; j < classes.length; j++)
        tempstr += "\t" + sum[j];
    console.log(tempstr);
}


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
    //display.Out();

    // console.log(clope.clusters);
    // console.log(repo.getClassesIDs());
    //DisplayClusters(clope, repo);
    display.GroupByColumnUniqueElementsAndDisplay(0);
    //display.InitializeAsync();
}

main(2.7);
//main(0.21);
//main(1.7);
// main(0.7);
// main(4.7);
// main(2);

//console.log("test")
