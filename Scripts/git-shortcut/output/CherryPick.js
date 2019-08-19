"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const fs = require("fs");
const path = require("path");
class CherryPickerHelper {
    /**
     * @param commitsFile 包含所有commit的文件，--oneline格式
     */
    constructor(commitsFile) {
        this.commitsFile = "";
        this.commits = [];
        this.index = 0;
        this.git = new utils_1.Git();
        this.commitsFile = commitsFile;
        let content = fs.readFileSync(path.resolve(commitsFile), { encoding: 'utf-8' });
        if (!content) {
            console.log(`read ${commitsFile} fail`);
            return;
        }
        this.commits = content.split('\n').reduce((result, line) => {
            let match = line.match(/(\w+) (.*)/);
            if (match) {
                result.push({
                    commitId: match[1],
                    message: match[2]
                });
            }
            return result;
        }, []);
        this.index = this.commits.length - 1;
    }
    run() {
        this.pickNextCommit().then(str => {
            console.log(str);
        }).catch(err => {
            console.log(err);
        });
    }
    pickNextCommit() {
        return new Promise((resolve, reject) => {
            if (this.index >= 0) {
                let commit = this.commits[this.index--];
                this.git.cherryPick(commit.commitId).then(out => {
                    return this.pickNextCommit();
                }).catch(err => {
                    this.saveResultToLocal();
                    reject(`cherry-pick fail at commit: ${commit.commitId} ${commit.message}\nplease resolve confict and commit manually, then run again`);
                });
            }
            else {
                resolve('cherry-pick finish');
            }
        });
    }
    saveResultToLocal() {
        let content = this.commits.slice(0, this.index + 1).map(commit => {
            return `${commit.commitId} ${commit.message}`;
        }).join('\n');
        fs.writeFileSync(this.commitsFile, content, { encoding: 'utf-8' });
    }
}
exports.CherryPickerHelper = CherryPickerHelper;
//# sourceMappingURL=CherryPick.js.map