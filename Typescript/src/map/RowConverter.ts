import { timingSafeEqual } from "crypto";

export interface IRowConverter<TRow> {
    Convert(row: TRow): any[];
}

export class RowConverterStringSplit implements IRowConverter<string> {
    private separator: string | RegExp;
    private limit?: number;

    constructor(separator: string | RegExp, limit?: number) {
        this.separator = separator;
        this.limit = limit;
    }
    public Convert(row: string): any[] {
        return row.split(this.separator, this.limit);
    }

}
