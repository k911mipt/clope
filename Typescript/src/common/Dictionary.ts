
export interface IDictionary<TKey, TValue> {
    Add(key: TKey, value: TValue): void;
    ContainsKey(key: TKey): boolean;
    Count(): number;
    Item(key: TKey): TValue;
    //Keys(): TKey[];
    Remove(key: TKey): TValue;
    //Values(): TValue[];
    TryGetValue(key: TKey): [boolean, TValue];
}


export class Dictionary<TKey, TValue> implements IDictionary<TKey, TValue> {
    // private items: { [index: string]: TValue } = {};
    private count: number = 0;
    private items: Map<string, TValue> = new Map<string, TValue>();

    private toString(key: TKey): string {
        //FIXME: написать нормальное приведение к строке
        return JSON.stringify(key);
    }
    private fromString(sKey: string): TKey {
        //FIXME: написать нормальное приведение к строке
        return JSON.parse(sKey);
    }
    public Add(key: TKey, value: TValue): void {
        if (this.items.has(this.toString(key)))
            return;
        //this.count++;
        this.items.set(this.toString(key), value);
    }
    ContainsKey(key: TKey): boolean {
        return this.items.has(this.toString(key));
    }
    Count(): number {
        return this.items.size;
    }
    Item(key: TKey): TValue {
        const value = this.items.get(this.toString(key));
        if (value != null) {
            return value;
        } else {
            throw new Error(`key ${key} was not found`)
        }
    }
    Keys(): TKey[] {
        var keySet: TKey[] = [];
        for (var prop in this.items) {
            if (this.items.hasOwnProperty(prop)) {
                keySet.push(this.fromString(prop));
            }
        }
        return keySet;
    }
    Remove(key: TKey): TValue {
        var val = this.Item(key);
        this.items.delete(this.toString(key))
        this.count--;
        return val;
    }
    // Values(): TValue[] {
    //     // var values: TValue[] = [];

    //     // for (var prop in this.items) {
    //     //     if (this.items.hasOwnProperty(prop)) {
    //     //         values.push(this.items[prop]);
    //     //     }
    //     // }
    //     // return values;
    // }
    //FIXME: ОБЯЗАТЕЛЬНО ПЕРЕПИСАТЬ, ТУТ КАКОЕ ТО ГОВНО
    TryGetValue(key: TKey): [boolean, TValue] {
        if (this.items.has(this.toString(key)))
            return [true, this.Item(key)]
        else return [false, this.Item(key)]
    }
}