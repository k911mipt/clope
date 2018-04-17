import { IDataSourceMapper, AsyncFileDataSource } from "./db/AsyncFileDataSource";
import { Clope } from "./clope/Clope";


//could be an object
let mapfromStringToObjects: IDataSourceMapper<string> = {
    map: (line: string) => line.split(",")
}


function main(args?: Array<string>) {
    const fileSource = new AsyncFileDataSource("/sample.txt", mapfromStringToObjects);
    const algo = new Clope(fileSource)
        .execute()
        .then(() => {
            //handle result
        })
}
main();


