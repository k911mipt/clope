import { MyObject } from './../common/Object';
import { ITransaction } from "../common/types";

export class Transaction implements ITransaction {
    public readonly elementKeys: Array<number>;  //список id объектов
    public elementKeyCount: number; //Количество объектов

    //public getElement(number)
    public getElement = (num: number) => this.elementKeys[num];

    constructor(capacity: number) {
        this.elementKeys = new Array<number>(capacity);
        this.elementKeyCount = 0;
    }
    public AddElementKey(idObject: number): void {
        this.elementKeys[this.elementKeyCount++] = idObject;
    }
}


export class TransactionElement extends MyObject {
    public Value: any;
    public NumberAttribute: number;
    //public UniqueNumber?: number;

    constructor(value: any, numberAttribute: number, uniqueNumber?: number) {
        super();
        this.Value = value;
        this.NumberAttribute = numberAttribute;
        //this.UniqueNumber = uniqueNumber
    }
    public GetHashCode(): number {
        return (this.Value != null ? this.Value.GetHashCode() : 0) ^ this.NumberAttribute;
    }
    public Equals(element: TransactionElement): boolean {
        return (this.NumberAttribute == element.NumberAttribute) && (this.Value == element.Value);
    }
}