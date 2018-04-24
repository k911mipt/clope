import fs from "fs";
import { resolve } from "path";
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
        try {
            const lineReader = ReadLine.createInterface({
                input: fs.createReadStream(this.filePath),
            });

            lineReader.on("line", callback);

            // tslint:disable-next-line:no-shadowed-variable
            return new Promise<void>((resolve) => lineReader.on("close", resolve));
        } catch (error) {
            return Promise.reject(error);
        }
    }
}
