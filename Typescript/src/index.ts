import FileDBHandler from "./db/fileDBHandler";
import { ClopePromise } from "./clope/clope";
import { Transaction } from "./db/Transaction";


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
    const fileDb = new FileDBHandler("testdata/sample.txt", (line) => {new Transaction(line)});

    const clope = new ClopePromise(fileDb)
        .startCPUClusterization(4)
        .then(res => console.log(res));
}

function main(args?: Array<string>) {
    runClope();
}
main();