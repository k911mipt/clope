import { ITransactionElement } from "../clope/Transaction";
//К сожалению, TS не умеет в override equals,
// а код вида
// let a=new TransactionElement("abc",5);
// let b=new TransactionElement("abc",5);
// console.log(a==b); => FALSE
// т.е, объекты одного класса и с одинаковыми полями не равны
// поэтому хардкодим словарь на реализацию транзакции
//универсальный Dictionary по json.stringify был в 8 раз медленнее.

export interface ITransactionDictionary<TValue> {
    Add(key: ITransactionElement, value: TValue): void;
    ContainsKey(key: ITransactionElement): boolean;
    Count(): number;
    Item(key: ITransactionElement): TValue;
    TryGetValue(key: ITransactionElement): [boolean, TValue | undefined];
}
export class TransactionDictionary<TValue> implements ITransactionDictionary<TValue> {
    private count: number = 0;
    private MapOfMap: Map<number, Map<any, TValue>> = new Map<number, Map<any, TValue>>();
    public Add(key: ITransactionElement, value: TValue): void {
        let MapOfElements = this.MapOfMap.get(key.NumberAttribute)
        if (MapOfElements == null) {
            MapOfElements = new Map<any, TValue>();
            this.MapOfMap.set(key.NumberAttribute, MapOfElements);
        }
        if (MapOfElements.has(key.Value))
            return;
        this.count++;
        MapOfElements.set(key.Value, value);
    }
    ContainsKey(key: ITransactionElement): boolean {
        const MapOfElements = this.MapOfMap.get(key.NumberAttribute)
        if (MapOfElements == null) return false;
        return MapOfElements.has(key.Value);
    }
    Count(): number {
        return this.count
    }
    Item(key: ITransactionElement): TValue {
        const MapOfElements = this.MapOfMap.get(key.NumberAttribute)
        if (MapOfElements != null) {
            const value = MapOfElements.get(key.Value);
            if (value != null)
                return value;
        }
        throw new Error(`key ${key} was not found`)
    }
    TryGetValue(key: ITransactionElement): [boolean, TValue | undefined] {
        const MapOfElements = this.MapOfMap.get(key.NumberAttribute)
        if (MapOfElements != null) {
            const value = MapOfElements.get(key.Value);
            if (value != null)
                return [true, value];
        }
        return [false, undefined];
    }
}