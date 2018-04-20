//// <reference path="../../node_modules/@types/node/index.d.ts" />

import fs from "fs";
import ReadLine from "readline";
import { IDataSourceAsync } from "./DataSourceAsync";
// var fs: any;
// var ReadLine: any;
export class FileDataSourceAsync implements IDataSourceAsync<string> {
    public isEnd: boolean;
    private filePath: string;
    private fileLineReader?: ReadLine.ReadLine;

    constructor(filePath: string) {
        this.isEnd = true;
        this.filePath = filePath;
    }

    public Connect(): Promise<void> {
        this.fileLineReader = ReadLine.createInterface({
            input: fs.createReadStream(this.filePath),
        });
        return new Promise<void>((resolve) => resolve());
    }
    public Reset(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (this.fileLineReader) {
                this.fileLineReader.on("close", resolve);
            } else {
                reject();
            }
        })
            .then(this.Connect.bind(this));
    }
    public ReadNext(myAction: (row: string) => void): void {
        if (this.fileLineReader == null) { throw Error("file is not connected"); }
        this.fileLineReader.on("line", (line: string) => myAction(line));
    }
}
