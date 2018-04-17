// import { ICluster, IAsyncDataSource } from './common/types';


// //is's possible to implement here abstract AsyncFileDataSource<T> 





// class Clopetemp<T> {

//     dataSource: IAsyncDataSource<T>
//     constructor(dataSource: IAsyncDataSource<T>) {
//         this.dataSource = dataSource;
//     }

//     //try to find a better name 
//     private processFirstPhaseAsync(): Promise<void> {
//         return this.dataSource
//             .connect()
//             .then(() => this.dataSource.readNext(this.handleFirstPhase1.bind(this)))
//             .then(() => this.dataSource.reset())
//             .then(() => cleanUP());
//     }

//     private processSecondPhaseAsync(): Promise<void> {
//         return this.dataSource
//             .connect()
//             .then(() => {
//                 this.dataSource.readNext(this.handleFirstPhase2.bind(this));
//                 return this.dataSource.reset(); // restart if condition 
//             })
//     }

//     execute(): Promise<ICluster> {
//         return this.processFirstPhaseAsync()
//             .then(this.processSecondPhaseAsync)
//             .then(() => new Array<ICluster>());
//     }

//     async executeAsyncAwait() {
//         await this.dataSource.connect();
//         this.dataSource.readNext(this.handleFirstPhase1.bind(this));
//         await this.dataSource.reset();


//         await this.dataSource.connect();
//         while (moved)
//             this.dataSource.readNext(this.handleFirstPhase2.bind(this));
//         await this.dataSource.reset(); // reload logic 
//         return Promise.resolve(new Array<ICluster>());
//     }

//     private getTransactionIds() { }
// }

// interface ITransactionMapper<T> {
//     map(row: T): Array<any>
// }

// //could be an object
// function mapfromStringToObjects(line: string) {
//     return Array<any>
// }

// function main() {
//     const fileSource = new AsyncFileDataSource("/sample.txt", "utf");
//     const clope = new Clope(mapfromStringToObjects, fileSource)
//         .execute()
//         .then(() => {
//             //handle result
//         })

// }