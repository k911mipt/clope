import fs from "fs";
import ReadLine from "readline";
import { IDataSourceIterator } from "../common/Typings";
import { subscribeReadLine } from "../event-iterator/event-iterator";

export default class FileDataSourceIterator implements IDataSourceIterator<string> {
    public isEnded: boolean;

    private readonly filePath: string;
    private asyncIterator?: AsyncIterator<Event>;

    constructor(filePath: string) {
        this.filePath = filePath;
        this.isEnded = true;
    }
    public Connect(): void {
        const lineReader = ReadLine.createInterface({
            input: fs.createReadStream(this.filePath),
        });
        this.asyncIterator = subscribeReadLine(lineReader, "line")[Symbol.asyncIterator]();
        this.isEnded = false;

    }
    public async ReadNextRow(): Promise<string | null> {
        if (this.isEnded) {
            return null;
            // throw new Error("tried to read from closed");
        }
        if (!this.asyncIterator) {
            this.isEnded = true;
            return null;
        }

        const row = await this.asyncIterator.next();
        // console.log(row.done);
        if (row.done) {
            this.isEnded = true;
            return null;
        }
        return String(row.value);
    }

    public SyncReadNextRow() {
        const row = this.ReadNextRow();
        console.log ("Sync " + row);
        if (row) {
            return row;
        }
        return null;
    }

    public Reset(): void {
        this.Connect();
    }

    public [Symbol.asyncIterator](): AsyncIterator<Event> {
        const lineReader = ReadLine.createInterface({
            input: fs.createReadStream(this.filePath),
        });
        return subscribeReadLine(lineReader, "line")[Symbol.asyncIterator]();
    }

    public async testGenerator(): Promise<void> {
        const lineReader = ReadLine.createInterface({
            input: fs.createReadStream(this.filePath),
        });
        // this.isClosed = false;
        const EL2 = subscribeReadLine(lineReader, "line");

        // (Symbol as any).asyncIterator = Symbol.asyncIterator
        // || Symbol.iterator || Symbol.for("Symbol.asyncIterator");
        const iter = EL2[Symbol.asyncIterator]();

        let abc = await iter.next();
        while (!abc.done) {
            console.log("\n" + abc.value + "\nreWorked next ");
            abc = await iter.next();
        }

        for await (const line of EL2) {
            // line

        }

        return new Promise<void>((resolve) => lineReader.on("close", resolve));
    }
}
