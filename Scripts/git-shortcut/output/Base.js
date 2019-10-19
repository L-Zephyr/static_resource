"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const fs = require("fs");
const path = require("path");
function runCommand(cmd, cwd = './') {
    return new Promise((resolve, reject) => {
        child_process_1.exec(cmd, { cwd: cwd }, (err, stdout, stderr) => {
            if (err || stderr) {
                reject(err ? err : stderr);
                return;
            }
            resolve(stdout);
        });
    });
}
exports.runCommand = runCommand;
/**
 * read commits from file
 * @param file file the contains all commit list, with '--oneline' format
 * @param reversed retrun reversed commit list, defaults to true
 */
function readCommitsFromFile(file, reversed = true) {
    let content = fs.readFileSync(path.resolve(file), { encoding: 'utf-8' });
    if (!content) {
        return [];
    }
    let commits = content.split('\n').reduce((result, line) => {
        let match = line.match(/(\w+)[ \t]+(.*)/);
        if (match) {
            result.push({
                commitId: match[1],
                message: match[2]
            });
        }
        return result;
    }, []);
    if (reversed) {
        commits.reverse();
    }
    return commits;
}
exports.readCommitsFromFile = readCommitsFromFile;
class Git {
    constructor(cwd = './') {
        this.cwd = cwd;
    }
    /**
     * cherry pick a commit
     */
    cherryPick(commitId, args = []) {
        return runCommand(`git cherry-pick ${commitId} ${args.join(' ')}`, this.cwd);
    }
    show(commitId, file = "", args = []) {
        return runCommand(`git show ${commitId} ${args.join(' ')} -- ${file}`, this.cwd);
    }
    /**
     * return change files at specify commit
     */
    getChangeFilesAt(commitId) {
        return runCommand(`git show ${commitId} --name-only --oneline`, this.cwd).then(msg => {
            let lines = msg.split('\n');
            if (lines.length <= 1) {
                return [];
            }
            return lines.slice(1); // remove first
        });
    }
}
exports.Git = Git;
class BaseCommand {
    constructor() {
        this.git = new Git();
    }
    run() {
    }
}
exports.BaseCommand = BaseCommand;
//# sourceMappingURL=Base.js.map