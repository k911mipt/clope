import { ColumnNumber, TransactionElement } from "../common/Typings";

export default class RuleSet<T> {
    private ConvertFunc: (row: T) => TransactionElement[];
    private skipElements: Set<TransactionElement>;
    private columnsToSkip: Set<ColumnNumber>;

    constructor(config: {
        ConvertFunc: ((row: T) => TransactionElement[])
        nullElements?: TransactionElement[],
        columnsToSkip?: number[],
    }) {
        this.skipElements = this.CreateSet(config.nullElements);
        this.columnsToSkip = this.CreateSet(config.columnsToSkip);
        this.ConvertFunc = config.ConvertFunc;
    }

    public Update(config: {
        ConvertFunc: ((row: T) => TransactionElement[])
        nullElements?: TransactionElement[],
        columnsToSkip?: ColumnNumber[],
    }): void {
        this.skipElements = this.CreateSet(config.nullElements);
        this.columnsToSkip = this.CreateSet(config.columnsToSkip);
        this.ConvertFunc = config.ConvertFunc;
    }

    public Apply(row: T): TransactionElement[] {
        return this.ConvertFunc(row);
    }

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

    public ApplyWithRulesToMap(row: T): Map<ColumnNumber, TransactionElement> {
        const elements = this.Apply(row);
        const filteredElements = new Map<ColumnNumber, TransactionElement>();
        for (let columnNumber = 0; columnNumber < elements.length; columnNumber++) {
            const element = elements[columnNumber];
            if (this.columnsToSkip.has(columnNumber) || this.skipElements.has(element)) {
                continue;
            } else {
                filteredElements.set(columnNumber, element);
            }
        }
        return filteredElements;
    }

    private CreateSet<TArray>(array?: TArray[]) {
        return array ? new Set(array) : new Set();
    }
}
