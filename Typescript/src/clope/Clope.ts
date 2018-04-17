import { IMapper } from './../map/Mapper';
import { AsyncFileDataSource } from "../db/AsyncFileDataSource";
import { IAsyncDataSource } from '../db/AsyncDataSource';
import { ICluster } from './Сluster';

export class Clope<T> {
    mapper: IMapper<T, IAsyncDataSource<T>>
    dataSource: IAsyncDataSource<T>
    constructor(dataSource: IAsyncDataSource<T>, mapper: IMapper<T, IAsyncDataSource<T>>) {
        this.mapper = mapper;
        this.dataSource = dataSource;
    }

    //try to find a better name 
    private processFirstPhaseAsync(): Promise<void> {
        return this.dataSource
            .connect()
            .then(() => this.dataSource.readNext(this.Initialize().bind(this)))
            .then(() => this.dataSource.reset())
            .then(() => this.cleanUP());
    }

    private processSecondPhaseAsync(): Promise<void> {
        return this.dataSource
            .connect()
            .then(() => {
                this.dataSource.readNext(this.Iterate().bind(this));
                return this.dataSource.reset(); // restart if condition 
            })
    }

    execute(): Promise<ICluster> {
        return this.processFirstPhaseAsync()
            .then(this.processSecondPhaseAsync)
            .then(() => new Array<ICluster>());
    }

    async executeAsyncAwait() {
        await this.dataSource.connect();
        this.dataSource.readNext(this.Initialize().bind(this));
        await this.dataSource.reset();


        await this.dataSource.connect();
        //while (moved)
        this.dataSource.readNext(this.Iterate().bind(this));
        await this.dataSource.reset(); // reload logic 
        return Promise.resolve(new Array<ICluster>());
    }
    Initialize(): any {
        throw new Error("Method not implemented.");

    }
    Iterate(): any {
        throw new Error("Method not implemented.");
    }
    cleanUP(): any {
        throw new Error("Method not implemented.");
    }
    private getTransactionIds() { }
}


