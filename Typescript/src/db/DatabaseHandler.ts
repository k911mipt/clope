import { TransactionElement, Transaction } from '../clope/Transaction';
import { Dictionary } from './../common/Dictionary';
import { IDatabaseHandler, ITransaction, IAsyncDBHandlerPromise } from "../common/types";

export abstract class AsyncDBHandlerPromise implements IAsyncDBHandlerPromise {
    private IsEndOfData: boolean;
    //mapper: (unspecifiedTransaction:T)=>Array<any>;
    protected constructor() {
        this.IsEndOfData = true;
            }


    abstract ReadLineEvent(action: (objects: Array<any>) => void): void;
    
    Closed(): Promise<void> {
        throw new Error("Method not implemented.");
    }




    public abstract TryReadNextTransaction(transaction: Transaction): boolean;




    abstract Reset(): boolean;
    abstract Connect(): boolean;
}
export abstract class DatabaseHandler implements IDatabaseHandler {
    private IsEndOfData: boolean;
    //mapper: (unspecifiedTransaction:T)=>Array<any>;

    protected constructor() {
        this.IsEndOfData = true;
            }


    abstract ReadLineEvent(action: (objects: Array<any>) => void): void;

    Closed(): Promise<void> {
        throw new Error("Method not implemented.");
    }




    public abstract TryReadNextTransaction(transaction: Transaction): boolean;




    abstract Reset(): boolean;
    abstract Connect(): boolean;
}

