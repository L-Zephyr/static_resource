"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Base_1 = require("./Base");
const fs = require("fs");
class CherryPickerHelper extends Base_1.BaseCommand {
    /**
     * @param commitsFile 包含所有commit的文件，--oneline格式
     */
    constructor(commitsFile, noCommit = false) {
        super();
        this.commitsFile = "";
        this.commits = [];
        this.end = 0;
        this.noCommit = false;
        this.commitsFile = commitsFile;
        this.commits = Base_1.readCommitsFromFile(commitsFile);
        this.noCommit = noCommit;
    }
    run() {
        if (this.commits.length == 0) {
            return;
        }
        (() => __awaiter(this, void 0, void 0, function* () {
            try {
                for (let commit of this.commits) {
                    this.end--;
                    let result = yield this.cherryPickCommit(commit);
                    console.log(result);
                }
                console.log('cherry-pick finish');
                this.saveResultToLocal();
            }
            catch (e) {
                console.log(e);
                this.saveResultToLocal();
            }
        }))();
    }
    cherryPickCommit(commit) {
        return new Promise((resolve, reject) => {
            this.git.cherryPick(commit.commitId, this.noCommit ? ['--no-commit'] : []).then(result => {
                resolve(`cherry-pick ${commit.commitId} ${commit.message}`);
            }).catch(err => {
                let errMsg = `${err}`;
                if (errMsg.search('hint: ') != -1) {
                    reject(`cherry-pick fail at commit: ${commit.commitId} ${commit.message}\nplease resolve confict and commit manually, then run again`);
                }
                else {
                    resolve(`cherry-pick ${commit.commitId} ${commit.message}`);
                }
            });
        });
    }
    saveResultToLocal() {
        let content = this.commits.reverse().slice(0, this.end).map(commit => {
            return `${commit.commitId} ${commit.message}`;
        }).join('\n');
        fs.writeFileSync(this.commitsFile, content, { encoding: 'utf-8' });
    }
}
exports.CherryPickerHelper = CherryPickerHelper;
//# sourceMappingURL=CherryPick.js.map