"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const readline_1 = __importDefault(require("readline"));
class Transaction {
    constructor(obj) {
        this.value = obj;
    }
}
exports.Transaction = Transaction;
class FileDBHandler {
    constructor(filePath, mapper) {
        this.filePath = filePath;
        this.mapper = mapper;
        this.stream = fs.createReadStream(this.filePath);
    }
    connect() {
        this.startReadNewFile();
        return true;
    }
    reset() {
        this.startReadNewFile();
        return true;
    }
    readLineEvent(action) {
        if (this.fileLineReader == null)
            throw Error("file is not connected");
        this.fileLineReader.on('line', (line) => action(this.mapper(line)));
    }
    closed() {
        return new Promise((resolve, reject) => {
            if (this.fileLineReader == null) {
                reject(Error("file is not connected"));
            }
            else {
                this.fileLineReader.on('close', resolve);
            }
        });
    }
    throwIfNotConnected() {
        if (this.fileLineReader == null)
            throw Error("file is not connected");
    }
    startReadNewFile() {
        this.fileLineReader = readline_1.default.createInterface({
            input: fs.createReadStream(this.filePath),
        });
    }
}
exports.default = FileDBHandler;
//# sourceMappingURL=fileDBHandler.js.map