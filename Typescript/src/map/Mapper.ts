import { TransactionElement } from './../clope/Transaction';
import { Dictionary } from './../common/Dictionary';
import { ITransaction } from '../common/types';

export interface IMapper {
    FormNewTransaction(elements: Array<any>): ITransaction;
    FullFillObjectsTable(): void;
    /**
     *
     */

}
export abstract class Mapper implements IMapper {
    FormNewTransaction(elements: any[]): ITransaction {
        throw new Error("Method not implemented.");
    }
    FullFillObjectsTable(): void {
        throw new Error("Method not implemented.");
    }
    private UniqueObjects: Dictionary<TransactionElement, number>;

    
    constructor() {
        this.UniqueObjects = new Dictionary<TransactionElement, number>();

    }

}
export class FileMapper extends Mapper {
    /**
     *
     */
    constructor() {
        super();

    }

}