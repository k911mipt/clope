import { ITransaction } from "../common/types";

export class Transaction implements ITransaction {
    public readonly elementKeys: Array<number>;  //список id объектов
    public elementKeyCount: number; //Количество объектов

    constructor(capacity: number) {
        this.elementKeys = new Array<number>(capacity);
        this.elementKeyCount = 0;
    }
    public AddElementKey(idObject: number): void {
        this.elementKeys[this.elementKeyCount++] = idObject;
    }
}


export class TransactionElement {
    public Value: any;
    public NumberAttribute: number;
    public UniqueNumber: number;

    constructor(value: any, numberAttribute: number, uniqueNumber: number) {
        this.Value = value;
        this.NumberAttribute = numberAttribute;
        this.UniqueNumber = uniqueNumber
    }
}