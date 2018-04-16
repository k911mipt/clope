import { IAsyncDBHandler, IAsyncDBHandlerPromise, ITransaction } from "../common/types";

import * as fs from "fs";
import readline from "readline";

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

        this.fileLineReader.on('line', (line) => action(this.mapper(line)))
    }

    Closed(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (this.fileLineReader == null) {
                reject(Error("file is not connected"))
            } else {
                this.fileLineReader.on('close', resolve)
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