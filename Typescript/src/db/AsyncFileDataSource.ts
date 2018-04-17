//import { ReadLine, createInterface } from "readline";
import { IAsyncDataSource, AsyncDataSource } from "./AsyncDataSource";
import fs from "fs";
import ReadLine from "readline";
export interface IDataSourceMapper<T> {
    map(row: T): Array<any>
}



export class AsyncFileDataSource implements IAsyncDataSource<string> {
    isEnd: boolean;
    filePath: string;

    stream: fs.ReadStream;
    fileLineReader?: ReadLine.ReadLine;

    //mapper: IDataSourceMapper<string>;
    //constructor(filePath: string, mapper: IDataSourceMapper<string>) {
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
        //throw new Error("Method not implemented.");
        return new Promise<void>((resolve) => resolve);
    }

    readNext(myAction: (row: string) => void): void {
        if (this.fileLineReader == null) throw Error("file is not connected")
        this.fileLineReader.on('line', (line) => myAction(line))
        //this.fileLineReader(action)
    }
    // private FullFillObjectsTable(): any {

    // }
    //private subscribe(transactionHandler: (tr: ITransaction) => void, closeHandler: () => void): void {
    //this.asyncDB.ReadLineEvent(transactionHandler.bind(this))
    //this.asyncDB.Closed(closeHandler.bind(this))
}