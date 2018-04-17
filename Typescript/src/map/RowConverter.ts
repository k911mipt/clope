import { timingSafeEqual } from "crypto";

export interface IRowConverter<TRow> {
    map(row: TRow): Array<any>
}
abstract class RowConverter<TRow> implements IRowConverter<TRow>{
    public abstract map(row: TRow): Array<any>;
}

export class RowConverterStringSplit extends RowConverter<string>{
    separator: string | RegExp;
    limit?: number;
    map(row: string): Array<any> {
        return row.split(this.separator, this.limit)
    }
    constructor(separator: string | RegExp, limit?: number) {
        super();
        this.separator = separator;
        this.limit = limit;
    }
}