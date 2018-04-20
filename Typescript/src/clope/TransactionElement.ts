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
