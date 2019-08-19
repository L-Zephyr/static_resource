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
        let tasks = this.commits.map(commit => {
            return new Promise((resolve, reject) => {
                this.git.cherryPick(commit.commitId).then(result => {
                    this.commits = this.commits.filter(val => val.commitId != commit.commitId);
                    resolve(`cherry-pick ${commit.commitId} ${commit.message}`);
                }).catch(err => {
                    this.commits = this.commits.filter(val => val.commitId != commit.commitId);
                    reject(`cherry-pick fail at commit: ${commit.commitId} ${commit.message}\nplease resolve confict and commit manually, then run again`);
                });
            });
        });
        Promise.all(tasks).then(results => {
            this.saveResultToLocal();
            console.log(results);
            console.log('cherry-pick finish');
        }).catch(err => {
            this.saveResultToLocal();
            console.log(err);
        });
    }
    saveResultToLocal() {
        let content = this.commits.map(commit => {
            return `${commit.commitId} ${commit.message}`;
        }).join('\n');
        fs.writeFileSync(this.commitsFile, content, { encoding: 'utf-8' });
    }
}
exports.CherryPickerHelper = CherryPickerHelper;
//# sourceMappingURL=CherryPick.js.map