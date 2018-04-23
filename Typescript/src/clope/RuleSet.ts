export default class RuleSet<T> {
    private ConvertFunc: (row: T) => any[];
    private skipElements: Set<T>;
    private indexToSkip: Set<number>;

    constructor(config: {
        ConvertFunc: ((row: T) => any[])
        nullElements?: any[],
        indexToSkip?: number[],
    }) {
        this.skipElements = this.CreateSet(config.nullElements);
        this.indexToSkip = this.CreateSet(config.indexToSkip);
        this.ConvertFunc = config.ConvertFunc;
    }

    public Update(config: {
        ConvertFunc: ((row: T) => any[])
        nullElements?: any[],
        indexToSkip?: number[],
    }): void {
        this.skipElements = this.CreateSet(config.nullElements);
        this.indexToSkip = this.CreateSet(config.indexToSkip);
        this.ConvertFunc = config.ConvertFunc;
    }

    public Apply(row: T): any[] {
        return this.ConvertFunc(row);
    }

    public ApplyWithRules(row: T): any[] {
        const elements = this.Apply(row);
        const filteredElements = [];
        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            if (this.indexToSkip.has(i) || this.skipElements.has(element)) {
                filteredElements.push(null);
            } else {
                filteredElements.push(element);
            }
        }
        return filteredElements;
    }

    private CreateSet<TArray>(array?: TArray[]) {
        return array ? new Set(array) : new Set();
    }
}
