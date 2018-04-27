import fs from "fs";
import ReadLine from "readline";
import { IDataSource } from "../common/Typings";

export default class FileDataSource implements IDataSource<string> {

    private readonly filePath: string;
    private isClosed: boolean;

    constructor(filePath: string) {
        this.filePath = filePath;
        this.isClosed = false;
    }

    public ReadAll(callback: (row: string) => void): Promise<void> {
        const lineReader = ReadLine.createInterface({
            input: fs.createReadStream(this.filePath),
        });

        lineReader.on("line", callback);

        return new Promise<void>((resolve) => lineReader.on("close", resolve));
    }
}
