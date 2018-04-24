import { UID } from "../common/Typings";
export default class Transaction {
    private elementUIDCount: number;

    private readonly elementUIDs: UID[];

    constructor(capacity: number) {
        this.elementUIDs = new Array<UID>(capacity);
        this.elementUIDCount = 0;
    }

    get size(): number {
        return this.elementUIDCount;
    }

    public GetElementUID(num: number): UID {
        return this.elementUIDs[num];
    }

    public AddElementKey(uid: UID): void {
        this.elementUIDs[this.elementUIDCount++] = uid;
    }
}
