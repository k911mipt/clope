export interface ITransaction {
    //readonly elementKeys: Array<number>;
    elementKeyCount: number;    //Количество объектов
    AddElementKey(idObject?: number, status?: boolean): void
    getElementKey(num: number): number;
}
export interface ITransactionWithMissedClusters extends ITransaction {

    getElementKeyStatus(num: number): boolean;
}
export class Transaction implements ITransaction {
    protected readonly elementKeys: Array<number>;  //список id объектов
    public elementKeyCount: number; //Количество объектов
    public getElementKey = (num: number) => this.elementKeys[num];
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
export class TransactionWithMissedClusters extends Transaction implements ITransactionWithMissedClusters {
    protected readonly elementKeyStatuses: Array<boolean>;  //список id объектов
    constructor(capacity: number) {
        super(capacity);
        this.elementKeyStatuses = new Array<boolean>(capacity);
    }
    public AddElementKey(idObject?: number, status?: boolean): void {
        if (idObject == null || status == null)
            throw new Error("Попытка добавить пустой элемент в транзакцию, проверить вызов!")
        this.elementKeys[this.elementKeyCount] = idObject;
        this.elementKeyStatuses[this.elementKeyCount++] = status;
    }
    public getElementKeyStatus = (num: number) => this.elementKeyStatuses[num];
}
export interface ITransactionElement {
    NumberAttribute: number;
    AttributeValue: any;
    //UniqueNumber: number;
}
export class TransactionElement implements ITransactionElement {
    public NumberAttribute: number;
    public AttributeValue: any;
    //public UniqueNumber?: number;
    constructor(value: any, numberAttribute: number, uniqueNumber?: number) {
        this.AttributeValue = value;
        this.NumberAttribute = numberAttribute;
        //this.UniqueNumber = uniqueNumber
    }
}