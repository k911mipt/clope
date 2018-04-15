"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fileDBHandler_1 = __importDefault(require("./db/fileDBHandler"));
const path_1 = require("path");
class ClopePoC {
    constructor(asyncDB) {
        this.asyncDB = asyncDB;
        this.numIteration = 0;
        this.moved = true;
    }
    startCPUClasterization(r) {
        this.numIteration = 0;
        this.moved = true;
        this.subPhase1();
    }
    subPhase1() {
        this.asyncDB.connect();
        this.subscribe(this.phase1, this.phaseClose);
    }
    subPhase2() {
        this.asyncDB.reset();
        this.subscribe(this.phase2, this.phase2Close);
    }
    phase1(next) {
        console.log("reading transaction");
    }
    phaseClose() {
        console.log("phase 1 ended");
        console.log("resetDB");
        this.subPhase2();
    }
    phase2(next) {
        console.log("reading transaction 2");
    }
    phase2Close() {
        if (this.moved) {
            this.moved = false;
            this.numIteration++;
            if (this.numIteration < 2)
                this.moved = true;
            this.subPhase2();
            console.log(`phase 2 restart, num ${this.numIteration}`);
        }
        else
            console.log("phase 2 ended");
    }
    subscribe(transactionHandler, closeHandler) {
        this.asyncDB.readLineEvent(transactionHandler.bind(this));
        this.asyncDB.closed(closeHandler.bind(this));
    }
}
class ClopePoCPromise {
    constructor(asyncDB) {
        this.asyncDB = asyncDB;
        this.numIteration = 0;
        this.moved = true;
    }
    runPhase1() {
        this.asyncDB.connect();
        this.asyncDB.readLineEvent(this.phase1);
        return this.asyncDB.closed();
    }
    runPhase2() {
        this.asyncDB.reset();
        this.asyncDB.readLineEvent(this.phase2.bind(this));
        return this.asyncDB.closed().then(() => {
            if (this.moved) {
                this.runPhase2();
                console.log("phase2");
            }
            else {
                path_1.resolve();
                console.log("phase ended");
            }
        });
    }
    startCPUClusterization(r) {
        return this.runPhase1()
            .then(r => this.runPhase2());
    }
    phase1(next) {
        console.log(next);
    }
    phase2(next) {
        this.moved = true;
        this.numIteration++;
        if (this.numIteration > 8)
            this.moved = false;
        console.log(next);
    }
}
function runClope() {
    const fileDb = new fileDBHandler_1.default("bin/sample.txt", (line) => new fileDBHandler_1.Transaction(line));
    const clope = new ClopePoCPromise(fileDb)
        .startCPUClusterization(4)
        .then(res => console.log(res));
}
function main(args) {
    runClope();
}
main();
//# sourceMappingURL=index.js.map