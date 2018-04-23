export default class RuleSet<T> {
    public convertFunc: (row: T) => any[];
    private readonly skipElements: Set<T>;
    private readonly indexToSkip: Set<number>;

    constructor(config: {
        convertFunc: ((row: T) => any[])
        nullElements?: any[],
        indexToSkip?: number[],
    }) {
        this.skipElements = this.createSet(config.nullElements);
        this.indexToSkip = this.createSet(config.indexToSkip);
        this.convertFunc = config.convertFunc;
    }

    public apply(row: T): any[] {
        return this.convertFunc(row);
    }

    // FIXME: ВОЗВРАЩАЕТ НЕКОРРЕКТНЫЙ МАССИВ, ПЕРЕДЕЛАТЬ НА МАП
    public applyWithRules(row: T): any[] {
        const elements = this.apply(row);
        const filteredElements = [];
        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];

            if (this.skipElements.has(element) || this.indexToSkip.has(i)) {
                filteredElements.push(null);
                // continue;
            } else {
                filteredElements.push(element);
            }
        }
        return filteredElements;
    }

    private createSet<TArray>(array?: TArray[]) {
        return array ? new Set(array) : new Set();
    }
}
