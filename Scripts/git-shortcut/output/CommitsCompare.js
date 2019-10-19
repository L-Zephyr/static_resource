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
class CommitsCompare extends Base_1.BaseCommand {
    constructor(commitsFile1, commitsFile2) {
        super();
        this.commitsAtFile1 = [];
        this.commitsAtFile2 = [];
        this.commitsFile1 = commitsFile1;
        this.commitsFile2 = commitsFile2;
        this.commitsAtFile1 = Base_1.readCommitsFromFile(commitsFile1);
        this.commitsAtFile2 = Base_1.readCommitsFromFile(commitsFile2);
        this.git.cwd = '/Users/lzephyr/Desktop/work/wechat';
    }
    run() {
        (() => __awaiter(this, void 0, void 0, function* () {
            let index = 0;
            let count = Math.min(this.commitsAtFile1.length, this.commitsAtFile2.length);
            let mismatchCount = 0;
            let filename1 = this.commitsFile1.split('/').pop();
            let filename2 = this.commitsFile2.split('/').pop();
            for (; index < count; ++index) {
                let commit1 = this.commitsAtFile1[index];
                let commit2 = this.commitsAtFile2[index];
                try {
                    yield this.diffChangesBetween(commit1.commitId, commit2.commitId);
                }
                catch (msg) {
                    mismatchCount++;
                    console.log(`There are difference between:\n${commit1.commitId} ${commit1.message} at ${filename1}\n${commit2.commitId} ${commit2.message} at ${filename2}\n${msg}\n`);
                }
            }
            console.log(`Total commit count: ${count}, Mismatch count: ${mismatchCount}`);
        }))();
    }
    diffChangesBetween(commitId1, commitId2) {
        return __awaiter(this, void 0, void 0, function* () {
            const skipType = "pbxproj";
            let files1 = (yield this.git.getChangeFilesAt(commitId1)).filter(name => {
                return name.length > 0 && !name.endsWith(skipType);
            });
            let files2 = (yield this.git.getChangeFilesAt(commitId2)).filter(name => {
                return name.length > 0 && !name.endsWith(skipType);
            });
            // 1. check if files differ
            let differs = files1.filter(name => !files2.includes(name))
                .concat(files2.filter(name => !files1.includes(name)));
            if (differs.length > 0) {
                throw `Mismatch files:\n${differs.join('\n')}`;
                return;
            }
            // 2. check each file content
            let mismatches = [];
            for (let file of files1) {
                let changeLines1 = this.getChangeLines(yield this.git.show(commitId1, file));
                let changeLines2 = this.getChangeLines(yield this.git.show(commitId2, file));
                let differs = changeLines1.filter(line => !changeLines2.includes(line))
                    .concat(changeLines2.filter(line => !changeLines1.includes(line)));
                if (differs.length > 0) {
                    mismatches.push(file);
                    // mismatches.push(`Mismatch commit files:\n${mismatches.join('\n')}`)
                }
            }
            if (mismatches.length > 0) {
                throw `Mismatch commit files:\n${mismatches.join('\n')}`;
            }
        });
    }
    getChangeLines(message) {
        let changeLines = [];
        let reg = /^[+-].*$/mg;
        let match = null;
        while ((match = reg.exec(message)) != null) {
            changeLines.push(match[0]);
        }
        return changeLines;
    }
}
exports.CommitsCompare = CommitsCompare;
//# sourceMappingURL=CommitsCompare.js.map