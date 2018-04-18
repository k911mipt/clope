import { TransactionElement } from './clope/Transaction';
import { AsyncFileDataSource } from "./db/AsyncFileDataSource";
import { RowConverterStringSplit } from "./map/RowConverter";
import { TransactionFileStore } from "./map/Repository";
import { Clope } from "./clope/Clope";


function main(args?: Array<string>) {
    //const fileSource = new AsyncFileDataSource("../Mushroom_DataSet/agaricus-lepiota.data", mapfromStringToObjects);
    const fileSource = new AsyncFileDataSource('../Mushroom_DataSet/agaricus-lepiota.data');
    const rowConverter = new RowConverterStringSplit(",");
    const mapper = new TransactionFileStore(fileSource, rowConverter);
    const clope = new Clope(mapper, 2.7)

    console.time("clope")
    clope.execute()
        .then(() => {
            console.timeEnd("clope")
            console.log("finished");
            console.log(clope._clusterList);

        })
    //.then(display)
}
let a = new TransactionElement("abc", 5);
let b = new TransactionElement("abc", 5);
console.log(a == b);
console.log(a === b);
console.log(Object.is(a, b));
console.log(typeof a);
//main();
//console.log("test")
