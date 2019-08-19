"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Utils_1 = require("./Utils");
class UnmergeCommit {
    constructor(targetBranch) {
        this.targetBranch = targetBranch;
    }
    run() {
        Utils_1.runCommand('git log');
    }
}
exports.UnmergeCommit = UnmergeCommit;
//# sourceMappingURL=UnmergeCommit.js.map