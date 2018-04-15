import { IAsyncDBHandler, IAsyncDBHandlerPromise, ITransaction } from "../common/types";

import * as fs from "fs";
import readline from "readline";

export class Transaction {
    value : String;
    constructor(obj : String) {
        this.value = obj;        
    }
}

export default class FileDBHandler implements IAsyncDBHandlerPromise {
    
    stream: fs.ReadStream;
    mapper: (tr: string) => ITransaction;
    filePath: string;
    fileLineReader?: readline.ReadLine;

    constructor(filePath : string, mapper: (tr: string) => ITransaction) {
        this.filePath = filePath;
        this.mapper = mapper;
        this.stream = fs.createReadStream(this.filePath);
    }

    connect(): boolean {
        this.startReadNewFile();
        return true;
    }

    reset(): boolean {
        this.startReadNewFile();
        return true;
    }
    
    readLineEvent(action: (tr: ITransaction) => void): void {
        if (this.fileLineReader == null) throw Error("file is not connected")
        
        this.fileLineReader.on('line', (line) => action(this.mapper(line)))
    }

    closed(): Promise<void> {
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

    private startReadNewFile(){
        this.fileLineReader = readline.createInterface({
            input: fs.createReadStream(this.filePath),
        });
    }
}