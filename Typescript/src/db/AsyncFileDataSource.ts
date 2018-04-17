//import { ReadLine, createInterface } from "readline";
import { IAsyncDataSource, AsyncDataSource } from "./AsyncDataSource";
import fs from "fs";
import ReadLine from "readline";
// export interface IDataSourceMapper<T> {
//     map(row: T): Array<any>
// }



export class AsyncFileDataSource implements IAsyncDataSource<string> {
    isEnd: boolean;
    filePath: string;

    stream: fs.ReadStream;
    fileLineReader?: ReadLine.ReadLine;

    constructor(filePath: string) {
        //super();
        this.isEnd = true;
        this.filePath = filePath;
        this.stream = fs.createReadStream(this.filePath);
    }

    connect(): Promise<void> {
        this.fileLineReader = ReadLine.createInterface({
            input: fs.createReadStream(this.filePath),
        });
        return new Promise<void>((resolve) => resolve());
    }
    reset(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (this.fileLineReader != null) {
                this.fileLineReader.on('close', resolve)
            } else {
                reject
            }
        })
    }

    readNext(myAction: (row: string) => void): void {
        if (this.fileLineReader == null) throw Error("file is not connected")
        this.fileLineReader.on('line', (line) => myAction(line))
    }
}