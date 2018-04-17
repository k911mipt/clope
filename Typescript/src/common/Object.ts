//c# based object
export interface IMyObject {
    GetHashCode(): number;
    //Equals(obj: IMyObject): boolean;
    Equals(obj1: IMyObject, obj2?: IMyObject): boolean;
}

export class MyObject implements IMyObject {
    GetHashCode(): number {
        //Object.
        throw new Error("Method not implemented.");
    }
    //protected Equals(obj: IObject): boolean;
    //protected Equals(obj1: IObject, obj2: IObject): boolean;
    Equals(obj1: MyObject, obj2?: MyObject): boolean {
        throw new Error("Method not implemented.");
    }
}
