interface IAsyncDataSource<T> {
    isEnd: string;
    reset(): Promise<void>; // or boolean
    connect(): Promise<void>;
    readNext(action: (row: T) => void): void;
}

//is's possible to implement here abstract AsyncFileDataSource<T> 

class AsyncFileDataSource implements IAsyncDataSource<string> {

    isEnd: string;
    constructor(filePath: string, encoding: string) { }
    connect() {
        return new Promise<void>();
    }
    reset() {
        return new Promise<void>();
    }

    readNext(action: (row: string) => void): void {
        //action(row)
    }
}

interface ITransaction {

}

interface ICluster {

}

class Clope<T> {

    uniqueTransaction: Map<ITransaction, Number>
    dataSource: IAsyncDataSource<T>
    constructor(mapper: (row: T) => ITransaction, dataSource: IAsyncDataSource<T>) {
        this.dataSource = dataSource
    }

    //try to find a better name 
    private processFirstPhaseAsync(): Promise<void> {
        return this.dataSource.connect()
            .then(() => {
                this.dataSource.readNext(this.handleFirstPhase1.bind(this));
                return this.dataSource.reset();
            });
    }

    private processSecondPhaseAsync(): Promise<void> {
        return this.dataSource.connect()
            .then(() => {
                this.dataSource.readNext(this.handleFirstPhase2.bind(this));
                return this.dataSource.reset(); // restart if condition 
            });
    }

    execute(): Promise<ICluster> {
        return this.processFirstPhaseAsync()
            .then(this.processSecondPhaseAsync)
            .then(() => new Array<ICluster>());
    }

    private getTransactionIds() { }
}
interface IAsyncDataSource<T> {
    isEnd: string;
    reset(): Promise<void>; // or boolean
    connect(): Promise<void>;
    readNext(action : (row : T) => void) : void;
}

//is's possible to implement here abstract AsyncFileDataSource<T> 

class AsyncFileDataSource implements IAsyncDataSource<string> {

    isEnd: string;
    constructor(filePath: string, encoding: string) { }
    connect() {
        return new Promise<void>();
    }
    reset() {
        return new Promise<void>();
    }

    readNext(action: (row: string) => void) : void {
        //action(row)
    }
}

interface ITransaction { 

}

interface ICluster { 

}

class Clope<T> {

    uniqueTransaction : Map<ITransaction, Number>
    dataSource : IAsyncDataSource<T>
    constructor(mapper: (row: T) => Array<any>, dataSource: IAsyncDataSource<T>) {
        this.dataSource = dataSource
    }

    //try to find a better name 
    private processFirstPhaseAsync(): Promise<void> {
        return this.dataSource.connect()
            .then(() => {
                this.dataSource.readNext(this.handleFirstPhase1.bind(this));
                return this.dataSource.reset();
            });
    }

    private processSecondPhaseAsync(): Promise<void> {
       return this.dataSource.connect()
            .then(() => {
                this.dataSource.readNext(this.handleFirstPhase2.bind(this));
                return this.dataSource.reset(); // restart if condition 
            });
    }

    execute() : Promise<ICluster> {
        return this.processFirstPhaseAsync()
            .then(this.processSecondPhaseAsync)
            .then(() => new Array<ICluster>());
    }

    private getTransactionIds() { }
}

interface ITransactionMapper<T> {
    map(row : T) : Array<any>
}

//could be an object
function mapfromStringToObjects(line: string) {
    return Array<any>
}

function main() {
    const fileSource = new AsyncFileDataSource("/sample.txt", "utf");
    const clope = new Clope(mapfromStringToObjects, fileSource)
        .execute()
        .then(() => {
            //handle result
        })

}