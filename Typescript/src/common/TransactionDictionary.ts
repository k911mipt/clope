import { ITransactionElement, TransactionElement } from "../clope/Transaction";
//К сожалению, TS не умеет в override equals,
// а код вида
// let a=new TransactionElement("abc",5);
// let b=new TransactionElement("abc",5);
// console.log(a==b); => FALSE
// т.е, объекты одного класса и с одинаковыми полями не равны
// поэтому хардкодим словарь на реализацию транзакции
//универсальный Dictionary<TKey,TValue> по json.stringify(TKey) был в 8 раз медленнее.
//TKey

export interface ITransactionDictionary<TValue> {
    Add(key: ITransactionElement, value: TValue): void;
    ContainsKey(key: ITransactionElement): boolean;
    Count(): number;
    Item(key: ITransactionElement): TValue;
    TryGetValue(key: ITransactionElement): [boolean, TValue | undefined];

    //forEach(callbackfn: (value: TValue, key: TKey, map: Map<TKey, TValue>) => void, thisArg?: any): void;
    forEach(callbackfn: (value: TValue, key: TransactionElement) => void, thisArg?: any): void;
}
export class TransactionArrayDictionary<TValue> implements ITransactionDictionary<TValue> {

    forEach(callbackfn: (Mvalue: TValue, Mkey: TransactionElement) => void, thisArg?: any): void {
        this.MapOfMap.forEach((element, index) => {
            element.forEach((value, key) => callbackfn(value, new TransactionElement(key, index)));
        });
    }
    private count: number = 0;
    private MapOfMap: Array<Map<any, TValue>> = new Array<Map<any, TValue>>();
    // forEach(callbackfn: (value: [TKey, TValue], index: number, array: [TKey, TValue][]) => void, thisArg?: any): void {
    //     this.MapOfMap[0].forEach
    //     throw new Error("Method not implemented!");
    // }
    public Add(key: ITransactionElement, value: TValue): void {
        if (key.NumberAttribute >= this.MapOfMap.length)
            for (let index = this.MapOfMap.length; index <= key.NumberAttribute; index++)
                this.MapOfMap.push(new Map<any, TValue>());

        if (this.MapOfMap[key.NumberAttribute].has(key.AttributeValue))
            return;
        this.count++;
        this.MapOfMap[key.NumberAttribute].set(key.AttributeValue, value);

    }
    ContainsKey(key: ITransactionElement): boolean {
        if (key.NumberAttribute > this.MapOfMap.length) return false;
        const MapOfElements = this.MapOfMap[key.NumberAttribute];
        if (MapOfElements == null) return false;
        return MapOfElements.has(key.AttributeValue);
    }
    Count(): number {
        return this.count
    }
    Item(key: ITransactionElement): TValue {
        if (key.NumberAttribute > this.MapOfMap.length) throw new Error(`key ${key} was not found`);
        const MapOfElements = this.MapOfMap[key.NumberAttribute];
        if (MapOfElements != null) {
            const value = MapOfElements.get(key.AttributeValue);
            if (value != null)
                return value;
        }
        throw new Error(`key ${key} was not found`)
    }
    TryGetValue(key: ITransactionElement): [boolean, TValue | undefined] {
        const MapOfElements = this.MapOfMap[key.NumberAttribute];
        if (MapOfElements != null) {
            const value = MapOfElements.get(key.AttributeValue);
            if (value != null)
                return [true, value];
        }
        return [false, undefined];
    }
}
export class TransactionMapDictionary<TValue> implements ITransactionDictionary<TValue> {
    //forEach(callbackfn: (value: TValue, key: TKey, map: Map<TKey, TValue>) => void, thisArg?: any): void;
    forEach(callbackfn: (value: TValue, key: TransactionElement) => void, thisArg?: any): void {
        throw new Error("Method not implemented.");
    }
    private count: number = 0;
    private MapOfMap: Map<number, Map<any, TValue>> = new Map<number, Map<any, TValue>>();
    public Add(key: ITransactionElement, value: TValue): void {
        let MapOfElements = this.MapOfMap.get(key.NumberAttribute)
        if (MapOfElements == null) {
            MapOfElements = new Map<any, TValue>();
            this.MapOfMap.set(key.NumberAttribute, MapOfElements);
        }
        if (MapOfElements.has(key.AttributeValue))
            return;
        this.count++;
        MapOfElements.set(key.AttributeValue, value);
    }
    ContainsKey(key: ITransactionElement): boolean {
        const MapOfElements = this.MapOfMap.get(key.NumberAttribute)
        if (MapOfElements == null) return false;
        return MapOfElements.has(key.AttributeValue);
    }
    Count(): number {
        return this.count
    }
    Item(key: ITransactionElement): TValue {
        const MapOfElements = this.MapOfMap.get(key.NumberAttribute)
        if (MapOfElements != null) {
            const value = MapOfElements.get(key.AttributeValue);
            if (value != null)
                return value;
        }
        throw new Error(`key ${key} was not found`)
    }
    TryGetValue(key: ITransactionElement): [boolean, TValue | undefined] {
        const MapOfElements = this.MapOfMap.get(key.NumberAttribute)
        if (MapOfElements != null) {
            const value = MapOfElements.get(key.AttributeValue);
            if (value != null)
                return [true, value];
        }
        return [false, undefined];
    }
}