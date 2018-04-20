export interface ITransactionElement {
    readonly number: number;
    readonly value: any;
}
export class TransactionElement implements ITransactionElement {
    public number: number;
    public value: any;
    constructor(value: any, numberAttribute: number, uniqueNumber?: number) {
        this.value = value;
        this.number = numberAttribute;
    }
}
