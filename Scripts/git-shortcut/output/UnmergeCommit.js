"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Base_1 = require("./Base/Base");
class UnmergeCommit {
    constructor(targetBranch) {
        this.targetBranch = targetBranch;
    }
    run() {
        Base_1.runCommand('git log');
    }
}
exports.UnmergeCommit = UnmergeCommit;
//# sourceMappingURL=UnmergeCommit.js.map