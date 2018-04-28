import fs from "fs";
import ReadLine from "readline";
import { IDataSourceIterator } from "../common/Typings";
import { subscribeReadLine } from "../event-iterator/event-iterator";

export default class FileDataSourceIterator implements IDataSourceIterator<string> {
    public isEnded: boolean;
    private readonly filePath: string;

    constructor(filePath: string) {
        this.filePath = filePath;
        this.isEnded = true;
    }
    public [Symbol.asyncIterator](): AsyncIterableIterator<string> {
        const lineReader = ReadLine.createInterface({
            input: fs.createReadStream(this.filePath),
        });
        return subscribeReadLine(lineReader, "line")[Symbol.asyncIterator]();
    }
}
