import fs from "fs";
import ReadLine from "readline";
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

        return subscribeReadLine(lineReader)[Symbol.asyncIterator]();
    }
}

// Чуть модифицированный код, взятый с
// https://github.com/rolftimmermans/event-iterator
// Подписка на события чтения строк из файла, с помещением их в очередь Promise
function subscribeReadLine(emitter: ReadLine.ReadLine) {
    return new EventIterator<string>(
        (push, stop, fail) => {
            emitter.addListener("line", push);
            emitter.addListener("close", stop);
            emitter.addListener("error", fail);
        },

        (push, stop, fail) => {
            emitter.removeListener("line", push);
            emitter.removeListener("close", stop);
            emitter.removeListener("error", fail);
        },
    );
}
