export interface ITransaction {
    readonly elementKeyCount: number;    //Количество объектов
    AddElementKey(idObject?: number): void
    GetElementKey(num: number): number;
}
export class Transaction implements ITransaction {
    protected readonly elementKeys: Array<number>;  //список id объектов
    public elementKeyCount: number; //Количество объектов
    //public GetElementKey = (num: number) => this.elementKeys[num];
    public GetElementKey(num: number) {
        return this.elementKeys[num];
    }
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
    readonly NumberAttribute: number;
    readonly AttributeValue: any;
}
export class TransactionElement implements ITransactionElement {
    public NumberAttribute: number;
    public AttributeValue: any;
    constructor(value: any, numberAttribute: number, uniqueNumber?: number) {
        this.AttributeValue = value;
        this.NumberAttribute = numberAttribute;
    }
}