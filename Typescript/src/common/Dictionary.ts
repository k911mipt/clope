export interface IDictionary<T, V> {
    Add(key: T, value: V): void;
    ContainsKey(key: T): boolean;
    Count(): number;
    Item(key: T): V;
    Keys(): T[];
    Remove(key: T): V;
    Values(): V[];
}

export class Dictionary<T, V> implements IDictionary<T, V> {
    private items: { [index: string]: V } = {};
    private count: number = 0;

    private toString(key: T): string {
        //FIXME: написать нормальное приведение к строке
        return JSON.stringify(key);
    }
    private fromString(sKey: string): T {
        //FIXME: написать нормальное приведение к строке
        return JSON.parse(sKey);
    }
    public Add(key: T, value: V): void {
        if (!this.items.hasOwnProperty(this.toString(key)))
            this.count++;
        this.items[this.toString(key)] = value;
    }
    ContainsKey(key: T): boolean {
        return this.items.hasOwnProperty(this.toString(key));
    }
    Count(): number {
        return this.count;
    }
    Item(key: T): V {
        return this.items[this.toString(key)];
    }
    Keys(): T[] {
        var keySet: T[] = [];
        for (var prop in this.items) {
            if (this.items.hasOwnProperty(prop)) {
                keySet.push(this.fromString(prop));
            }
        }
        return keySet;
    }
    Remove(key: T): V {
        var val = this.items[this.toString(key)];
        delete this.items[this.toString(key)];
        this.count--;
        return val;
    }
    Values(): V[] {
        var values: V[] = [];

        for (var prop in this.items) {
            if (this.items.hasOwnProperty(prop)) {
                values.push(this.items[prop]);
            }
        }
        return values;
    }
}