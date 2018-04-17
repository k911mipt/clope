import { IRowConverter, RowConverterStringSplit } from './map/RowConverter';
import { IAsyncDataSource } from './db/AsyncDataSource';
import { AsyncFileDataSource } from "./db/AsyncFileDataSource";
import { Clope } from "./clope/Clope";
import { Mapper, FileMapper } from "./map/Mapper";


//could be an object
// let mapfromStringToObjects: IDataSourceMapper<string> = {
//     map: (line: string) => line.split(" ")
// }


function main(args?: Array<string>) {
    //const fileSource = new AsyncFileDataSource("../Mushroom_DataSet/agaricus-lepiota.data", mapfromStringToObjects);
    const fileSource = new AsyncFileDataSource("../Mushroom_DataSet/tempFile.txt");
    const rowConverter = new RowConverterStringSplit(",");
    const mapper = new FileMapper<string, IAsyncDataSource<string>>(fileSource, rowConverter);
    mapper.FullFillObjectsTable();
}
main();
console.log("test")


