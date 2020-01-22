"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Base_1 = require("./Base/Base");
const trunk = "trunk";
const br_trunk = "br_trunk";
const author = "zephyrlv";
class UnmergeCommit extends Base_1.BaseCommand {
    constructor(branch = br_trunk, grep) {
        super();
        this.grep = [];
        this.branch = br_trunk;
        if (grep && grep.length > 0) {
            this.grep = [grep];
        }
        if (branch && branch.length > 0) {
            this.branch = branch;
        }
    }
    run() {
        this.git.logCommits(trunk, "", author, this.grep).then(trunkCommits => {
            return this.git.logCommits(this.branch, "", author, this.grep).then(brCommits => {
                this.compare(trunkCommits, brCommits);
            });
        }).catch(err => {
            console.log(err);
        });
    }
    compare(trunkCommits, brCommits) {
        let reg = new RegExp("^[a-z0-9]* (\(.*\) )?(.*)");
        let trunkMsgSet = new Set();
        for (let commit of trunkCommits) {
            trunkMsgSet.add(commit.message);
        }
        for (let commit of brCommits) {
            if (!trunkMsgSet.has(commit.message)) {
                console.log(`unmerge commit in ${this.branch}: ${commit.commitId} ${commit.message}`);
            }
        }
    }
}
exports.UnmergeCommit = UnmergeCommit;
//# sourceMappingURL=UnmergeCommit.js.map