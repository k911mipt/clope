import { resolve } from "path";
import { ITransaction, IAsyncDBHandler, IAsyncDBHandlerPromise, IClopePoCPromise } from "../common/types";
import { Dictionary } from "../common/Dictionary";
import { TransactionElement } from "./Transaction";

export class ClopePromise {
    protected readonly UniqueObjects: Dictionary<TransactionElement, number>;
    numIteration: number;
    moved: boolean;
    asyncDB: IAsyncDBHandlerPromise;

    public GetObjectsCount(): number {
        return this.UniqueObjects.Count();
    }
    constructor(asyncDB: IAsyncDBHandlerPromise) {
        this.UniqueObjects = new Dictionary<TransactionElement, number>();
        this.asyncDB = asyncDB;
        this.numIteration = 0;
        this.moved = true;
    }

    runPhase1(): Promise<void> {
        this.asyncDB.Connect()
        this.asyncDB.ReadLineEvent(this.phase1)
        return this.asyncDB.Closed()
    }

    runPhase2(): Promise<void> {
        this.asyncDB.Reset();
        this.asyncDB.ReadLineEvent(this.phase2.bind(this))

        return this.asyncDB.Closed().then(() => {
            if (this.moved) {
                this.runPhase2()
                console.log("phase2")
            }
            else {
                resolve()
                console.log("phase ended");

            }
        })
    }

    startCPUClusterization(r: Number): Promise<void> {
        return this.runPhase1()
            .then(r => this.runPhase2())
    }

    private phase1(next: ITransaction) {
        console.log(next)
    }

    private phase2(next: ITransaction) {
        this.moved = true;
        this.numIteration++;
        if (this.numIteration > 8) this.moved = false;
        console.log(next);
    }

}

class ClopeOld {
    numIteration: number;
    moved: boolean;
    asyncDB: IAsyncDBHandler;

    constructor(asyncDB: IAsyncDBHandler) {
        this.asyncDB = asyncDB;
        this.numIteration = 0;
        this.moved = true;
    }

    startCPUClasterization(r: Number): void {
        this.numIteration = 0;
        this.moved = true;
        this.subPhase1();


    }

    private subPhase1() {
        this.asyncDB.Connect()
        this.subscribe(this.phase1, this.phaseClose)
    }

    private subPhase2() {
        this.asyncDB.Reset()
        this.subscribe(this.phase2, this.phase2Close)
    }
    private phase1(next: ITransaction) {
        console.log("reading transaction")
    }

    private phaseClose() {
        console.log("phase 1 ended")
        console.log("resetDB")
        this.subPhase2();
    }

    private phase2(next: ITransaction) {
        console.log("reading transaction 2")
    }

    private phase2Close() {
        if (this.moved) {
            this.moved = false;
            this.numIteration++;
            if (this.numIteration < 2) this.moved = true;
            this.subPhase2();
            console.log(`phase 2 restart, num ${this.numIteration}`)
        }
        else
            console.log("phase 2 ended")
    }

    private subscribe(transactionHandler: (tr: ITransaction) => void, closeHandler: () => void): void {
        this.asyncDB.ReadLineEvent(transactionHandler.bind(this))
        //this.asyncDB.Closed(closeHandler.bind(this))
    }

}