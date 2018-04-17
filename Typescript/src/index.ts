import { IDataSourceMapper, AsyncFileDataSource } from "./db/AsyncFileDataSource";
import { Clope } from "./clope/Clope";


//could be an object
let mapfromStringToObjects: IDataSourceMapper<string> = {
    map: (line: string) => line.split(",")
}


function main(args?: Array<string>) {
    const fileSource = new AsyncFileDataSource("../Mushroom_DataSet/agaricus-lepiota.data", mapfromStringToObjects);
    fileSource
        .connect()
        .then(() => {
            fileSource.readNext((line)=>console.log(line));
            return fileSource.reset(); // restart if condition 
        })

    // const algo = new Clope(fileSource)
    //     .execute()
    //     .then(() => {
    //         //handle result
    //     })
}
main();
console.log("test")


