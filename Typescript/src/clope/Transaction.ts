export interface ITransaction {
    readonly elementKeyCount: number;
    AddElementKey(idObject: number): void;
    GetElementKey(num: number): number;
}
export class Transaction implements ITransaction {
    public elementKeyCount: number;

    private readonly elementKeys: number[];

    constructor(capacity: number) {
        this.elementKeys = new Array<number>(capacity);
        this.elementKeyCount = 0;
    }
    public GetElementKey(num: number) {
        return this.elementKeys[num];
    }
    public AddElementKey(idObject: number): void {
        if (idObject == null) {
            console.assert(idObject !== 1, "Попытка добавить пустой элемент в транзакцию, проверить вызов!");
        }
        this.elementKeys[this.elementKeyCount++] = idObject;
    }
}
