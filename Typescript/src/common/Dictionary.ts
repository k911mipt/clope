
export interface IDictionary<TKey, TValue> {
    Add(key: TKey, value: TValue): void;
    ContainsKey(key: TKey): boolean;
    Count(): number;
    Item(key: TKey): TValue;
    Keys(): TKey[];
    Remove(key: TKey): TValue;
    Values(): TValue[];
    TryGetValue(key: TKey): [boolean, TValue];
}


export class Dictionary<TKey, TValue> implements IDictionary<TKey, TValue> {
    private items: { [index: string]: TValue } = {};
    private count: number = 0;

    private toString(key: TKey): string {
        //FIXME: написать нормальное приведение к строке
        return JSON.stringify(key);
    }
    private fromString(sKey: string): TKey {
        //FIXME: написать нормальное приведение к строке
        return JSON.parse(sKey);
    }
    public Add(key: TKey, value: TValue): void {
        if (!this.items.hasOwnProperty(this.toString(key)))
            this.count++;
        this.items[this.toString(key)] = value;
    }
    ContainsKey(key: TKey): boolean {
        return this.items.hasOwnProperty(this.toString(key));
    }
    Count(): number {
        return this.count;
    }
    Item(key: TKey): TValue {
        return this.items[this.toString(key)];
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
        var val = this.items[this.toString(key)];
        delete this.items[this.toString(key)];
        this.count--;
        return val;
    }
    Values(): TValue[] {
        var values: TValue[] = [];

        for (var prop in this.items) {
            if (this.items.hasOwnProperty(prop)) {
                values.push(this.items[prop]);
            }
        }
        return values;
    }
    //FIXME: ОБЯЗАТЕЛЬНО ПЕРЕПИСАТЬ, ТУТ КАКОЕ ТО ГОВНО
    TryGetValue(key: TKey): [boolean, TValue] {
        let success = this.ContainsKey(key);
        if (success)
            return [true, this.Item(key)]
        else return [false, this.Item(key)]
    }
}