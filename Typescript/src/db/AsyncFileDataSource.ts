import { ReadLine, createInterface } from "readline";
import { AsyncDataSource } from "./AsyncDataSource";

export interface IDataSourceMapper<T> {
    map(row: T): Array<any>
}



export class AsyncFileDataSource implements AsyncDataSource<string> {
    isEnd: boolean;
    fileLineReader?: ReadLine;
    mapper: IDataSourceMapper<string>;
    constructor(filePath: string, mapper: IDataSourceMapper<string>) {
        this.isEnd = true;
        this.mapper = mapper;
    }


    connect() {
        return new Promise<void>((resolve) => resolve());
    }
    reset() {
        return new Promise<void>((resolve) => resolve);
    }

    readNext(action: (row: string) => void): void {
        //this.fileLineReader(action)
    }
    //private subscribe(transactionHandler: (tr: ITransaction) => void, closeHandler: () => void): void {
    //this.asyncDB.ReadLineEvent(transactionHandler.bind(this))
    //this.asyncDB.Closed(closeHandler.bind(this))
}