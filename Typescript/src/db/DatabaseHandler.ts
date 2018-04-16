import { IDatabaseHandler, ITransaction } from "../common/types";

export abstract class DatabaseHandler implements IDatabaseHandler {

    readNextTransaction(): ITransaction {
        throw new Error("Method not implemented.");
    }

    abstract reset(): boolean;
    abstract connect(): boolean;
}

