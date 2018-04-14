import { ColumnNumber, TransactionElement } from "../common/Typings";

export default class RuleSet<T> {
    protected ConvertFunc: (row: T) => TransactionElement[];
    protected skipElements: Set<TransactionElement>;
    protected columnsToSkip: Set<ColumnNumber>;

    /**
     * @param config update parametres: row convertation function, array of elements
     * we take as null and array of column numbers we want to skip
     */
    constructor(config: {
        ConvertFunc: ((row: T) => TransactionElement[])
        nullElements?: TransactionElement[],
        columnsToSkip?: number[],
    }) {
        this.skipElements = this.CreateSet(config.nullElements);
        this.columnsToSkip = this.CreateSet(config.columnsToSkip);
        this.ConvertFunc = config.ConvertFunc;
    }

    /**
     * Update rules
     * @param config update parametres: row convertation function, array of elements
     * we take as null and array of column numbers we want to skip
     */
    public Update(config: {
        ConvertFunc: ((row: T) => TransactionElement[])
        nullElements?: TransactionElement[],
        columnsToSkip?: ColumnNumber[],
    }): void {
        this.skipElements = this.CreateSet(config.nullElements);
        this.columnsToSkip = this.CreateSet(config.columnsToSkip);
        this.ConvertFunc = config.ConvertFunc;
    }

    /**
     * Converting row using all rules into arry of any
     * @param row row needed to convert
     */
    public ApplyWithRules(row: T): TransactionElement[] {
        const filteredElements = this.Apply(row);
        for (let columnNumber = 0; columnNumber < filteredElements.length; columnNumber++) {
            const element = filteredElements[columnNumber];
            if (this.columnsToSkip.has(columnNumber) || this.skipElements.has(element)) {
                filteredElements[columnNumber] = null;
            }
        }
        return filteredElements;
    }

    /**
     * Converting row using only converting function into arry of any
     * @param row row needed to convert
     */
    public Apply(row: T): TransactionElement[] {
        return this.ConvertFunc(row);
    }

    private CreateSet<TArray>(array?: TArray[]): Set<TArray> {
        return array ? new Set(array) : new Set();
    }
}
