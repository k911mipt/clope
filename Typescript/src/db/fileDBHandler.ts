import { resolve } from 'path';
import { IAsyncDBHandler, ITransaction } from "../common/types";

import * as fs from "fs";
import readline from "readline";

export interface IAsyncDBHandlerPromise {
    Connect(): boolean;
    Reset(): boolean;
    ReadLineEvent(action: (tr: ITransaction) => void): void
    Closed(): Promise<boolean>
}
export default class FileDBHandler implements IAsyncDBHandlerPromise {

    stream: fs.ReadStream;
    mapper: (tr: string) => Array<any>;
    filePath: string;
    fileLineReader?: readline.ReadLine;

    constructor(filePath: string, mapper: (tr: string) => Array<any>) {
        this.filePath = filePath;
        this.mapper = mapper;
        this.stream = fs.createReadStream(this.filePath);
    }

    Connect(): boolean {
        this.startReadNewFile();
        return true;
    }

    Reset(): boolean {
        this.startReadNewFile();
        return true;
    }

    ReadLineEvent(action: (tr: ITransaction) => void): void {
        if (this.fileLineReader == null) throw Error("file is not connected")
        this.fileLineReader.on('line', (line) => console.log(line))
        //this.fileLineReader.on('line', (line) => action(this.mapper(line)))
    }

    Closed(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            if (this.fileLineReader == null) {
                resolve(false)
            } else {
                resolve(true)
            }
        })
    }

    private throwIfNotConnected() {
        if (this.fileLineReader == null) throw Error("file is not connected")
    }

    private startReadNewFile() {
        this.fileLineReader = readline.createInterface({
            input: fs.createReadStream(this.filePath),
        });
    }
}
// class Mapper<T> {
//     map(line : T) :ITransaction{
//         return new ITransaction
//     }
//    }