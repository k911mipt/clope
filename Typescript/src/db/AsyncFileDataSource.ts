import { IAsyncDataSource } from "./AsyncDataSource";
import fs from "fs";
import ReadLine from "readline";
export class AsyncFileDataSource implements IAsyncDataSource<string> {
    isEnd: boolean;
    filePath: string;
    fileLineReader?: ReadLine.ReadLine;

    constructor(filePath: string) {
        this.isEnd = true;
        this.filePath = filePath;
    }

    connect(): Promise<void> {
        this.fileLineReader = ReadLine.createInterface({
            input: fs.createReadStream(this.filePath),
        });
        return new Promise<void>((resolve) => resolve());
    }
    reset(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (this.fileLineReader) {
                this.fileLineReader.on('close', resolve)
            } else {
                reject()
            }
        })
            .then(this.connect.bind(this))
    }
    readNext(myAction: (row: string) => void): void {
        if (this.fileLineReader == null) throw Error("file is not connected")
        this.fileLineReader.on('line', (line) => myAction(line))
    }
}