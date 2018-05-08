# Clope algorithm implementation
Hi! This is TypeScript implementation of **Clope** algorithm for Node.js.
Ground theory bases here: [CLOPE: A Fast and Effective Clustering Algorithm for Transactional Data](http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.13.7142&rep=rep1&type=pdf)
## Getting Started
These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.
### Prerequisites
In order to continue developing, or to have a better look inside algo wit debugger, you need to copy this folder and install dev depenencies by running this command in folder root
``` cmd
npm install
```
It will download node types for TypeScript, and linting features.
## Files
These files contain everything you need to compile this project into pure js and be able to run in node.js:

`package.json, tsconfig.json`

I recommend using VSCode to view and compile project, there are also vscode configuration files for this project located at `\.vscode\`
## Entry point
file **index.ts** is an example of using clope algorith and also displaying some grouped data with [Mushroom dataset](https://archive.ics.uci.edu/ml/datasets/mushroom)
*(there is a folder with dataset in this repository, upper level from here)*
This program uses `for-await-of` with async iterators, so it needs a global polyfill:
``` TypeScript
(Symbol  as  any).asyncIterator = Symbol.asyncIterator || Symbol.iterator || Symbol.for("Symbol.asyncIterator");
```
## Using with own datasources
This algo needs a **Data source** and **Convert function**
-  ### IDataSource< T >
Described in *\src\common\Typings.ts*
``` TypeScript
interface IDataSource<T> {
	[Symbol.asyncIterator](): AsyncIterableIterator<T>;
}
```
Example is in *\src\db\FileDataSource.ts*
You will need an async iterator over your data, returning pure transaction rows.
-  ### Convert function
In order to use that rows you will need a *convert function* which i use inside of `Ruleset<T>` class located at *\src\clope\RuleSet.ts*
``` TypeScript
ConvertFunc: ((row: T) => any[])
```
When you create a `Ruleset<T>`, you must describe that function, like i did it for string lines:
``` TypeScript
const ruleSet = new RuleSet<string>({
	ConvertFunc: (row: string) => row.split(","),
	columnsToSkip: [0],
	nullElements: ["?"],
});
```
## Thanks
Big thanks to **rolftimmermans** for his [event-iterator](https://github.com/rolftimmermans/event-iterator).

I took his code and bit modified it for own purpose. You can see it at *\src\event-iterator\event-iterator.ts*