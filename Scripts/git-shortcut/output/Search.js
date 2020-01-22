"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Base_1 = require("./Base/Base");
class Search extends Base_1.BaseCommand {
    constructor(regex, branch = "", limit = 0, file = "") {
        super();
        this.regex = regex;
        this.branch = branch;
        this.limit = limit;
        this.file = file;
    }
    run() {
        // this.git.logCommits(this.branch, this.file, this.limit).then(commits => {
        //     return Promise.all(
        //         commits.map(sha => {
        //         })
        //     );
        // })
    }
    search(commits) {
        commits.map(sha => {
            this.git.show(sha).then(content => {
                this.searchChanges(content);
            });
        });
    }
    searchChanges(changeLog) {
        let changeLineRule = /^[+-].*/mg;
        let matchRule = new RegExp(this.regex, 'mg');
        let match = null;
        let lines = changeLog.split('\n');
        while ((match = changeLineRule.exec(changeLog)) != null) { // 找到发生变更的行
        }
    }
}
exports.Search = Search;
//# sourceMappingURL=Search.js.map