import { IAsyncDBHandler, ICluster, ITransaction, IAsyncDBHandlerPromise } from './common/types';
import { ArgumentParser } from "argparse";
import * as fs from "fs";
import readline from "readline";
import FileDBHandler, { Transaction } from "./db/fileDBHandler";
import { resolve } from 'path';
import { Cluster } from 'cluster';
import { ClopePoCPromise } from './clope';
//import { ClopePoCPromise} from './clope';

/*
// const parser = new ArgumentParser({
//         version: '0.0.1',
//         addHelp:true,
//         description: 'Argparse example'
//     }
// );

// parser.addArgument(
//     [ '-f', '--foo' ],
//     {
//       help: 'foo bar'
//     }
//   );
//   parser.addArgument(
//     [ '-b', '--bar' ],
//     {
//       help: 'bar foo'
//     }
//   );
//   parser.addArgument(
//     ['--baz'],
//     {
//       help: 'baz bar'
//     } 
//   );
// const args = parser.parseArgs();
// console.log(args);
*/

function runClope() {
    const fileDb = new FileDBHandler("testdata/sample.txt", (line) => new Transaction(line));

    const clope = new ClopePoCPromise(fileDb)
        .startCPUClusterization(4)
        .then(res => console.log(res));
}

function main(args?: Array<string>) {
    runClope();
}
main();