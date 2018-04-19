// import { timingSafeEqual } from "crypto";
export interface IRowConverter<TRow> {
    convert(row: TRow): Array<any>
}
abstract class RowConverter<TRow> implements IRowConverter<TRow>{
    public abstract convert(row: TRow): Array<any>;
}

export class RowConverterStringSplit extends RowConverter<string>{
    separator: string | RegExp;
    limit?: number;
    convert(row: string): Array<any> {
        return row.split(this.separator, this.limit)
    }

    constructor(separator: string | RegExp, limit?: number) {
        super();
        this.separator = separator;
        this.limit = limit;
    }

}


// function rowConverter(separator: string | RegExp, limit?: number) {
//     return (line: string) => line.split(separator, limit)
// }


