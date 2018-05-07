import fs from "fs";
import ReadLine from "readline";
import { EventEmitter } from "stream";
import { IDataSource } from "../common/Typings";
import EventIterator from "../event-iterator/event-iterator";

export default class FileDataSource implements IDataSource<string> {
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

// Чуть модифицированный код, взятый с
// https://github.com/rolftimmermans/event-iterator
function subscribeReadLine(emitter: EventEmitter, event: string) {
    return new EventIterator<string>(
        (push, stop, fail) => {
            emitter.addListener(event, push);
            emitter.addListener("close", stop);
            emitter.addListener("error", fail);
        },

        (push, stop, fail) => {
            emitter.removeListener(event, push);
            emitter.removeListener("close", stop);
            emitter.removeListener("error", fail);
        },
    );
}
