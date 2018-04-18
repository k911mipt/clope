export interface ITransaction {
    readonly elementKeys: Array<number>;
    elementKeyCount: number;    //Количество объектов
    AddElementKey(idObject: number): void
    getElement(num: number): number;
}
export class Transaction implements ITransaction {
    public readonly elementKeys: Array<number>;  //список id объектов
    public elementKeyCount: number; //Количество объектов
    public getElement = (num: number) => this.elementKeys[num];
    constructor(capacity: number) {
        this.elementKeys = new Array<number>(capacity);
        this.elementKeyCount = 0;
    }
    public AddElementKey(idObject?: number): void {
        if (idObject == null)
            throw new Error("Попытка добавить пустой элемент в транзакцию, проверить вызов!")
        this.elementKeys[this.elementKeyCount++] = idObject;
    }
}
export interface ITransactionElement {
    NumberAttribute: number;
    Value: any;
    //UniqueNumber: number;
}
export class TransactionElement {
    public NumberAttribute: number;
    public Value: any;
    //public UniqueNumber?: number;
    constructor(value: any, numberAttribute: number, uniqueNumber?: number) {
        this.Value = value;
        this.NumberAttribute = numberAttribute;
        //this.UniqueNumber = uniqueNumber
    }
}