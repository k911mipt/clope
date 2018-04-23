export default class Transaction {
    [index: number]: number;
    private elementKeyCount: number;

    private readonly elementKeys: number[];

    constructor(capacity: number) {
        this.elementKeys = new Array<number>(capacity);
        this.elementKeyCount = 0;
    }

    get size(): number {
        return this.elementKeyCount;
    }

    public GetElementKey(num: number): number {
        return this.elementKeys[num];
    }

    public AddElementKey(idObject: number): void {
        this.elementKeys[this.elementKeyCount++] = idObject;
    }
}
