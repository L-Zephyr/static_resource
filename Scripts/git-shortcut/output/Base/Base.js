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
     * run command at current cwd
     */
    run(command) {
        return runCommand(command, this.cwd);
    }
    /**
     * cherry pick a commit
     */
    cherryPick(commitId, args = []) {
        return runCommand(`git cherry-pick ${commitId} ${args.join(' ')}`, this.cwd);
    }
    /**
     * specify commit id and file name, show change lines
     */
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
    /**
     * 查看指定文件某一行的最后修改人
     */
    blame(file, line) {
        return runCommand(`git blame -L ${line},${line} ${file}`, this.cwd).then(info => {
            let match = info.match(/^.* \((.*?) .*\)/);
            if (match && match[1]) {
                return match[1];
            }
            return "";
        }).catch(err => {
            return "";
        });
    }
    /**
     * blamed的同步版本
     */
    blameSync(file, line) {
        try {
            let output = child_process_1.execSync(`git blame -L ${line},${line} ${file}`, { cwd: this.cwd, encoding: 'utf8' });
            let match = output.match(/^.* \((.*?) .*\)/);
            if (match && match[1]) {
                return match[1];
            }
        }
        catch (_a) {
            return "";
        }
        return "";
    }
    /**
     * return latest commit md5 for sepecify branch
     * @param branch target branch name
     * @param file sepecify file to log
     * @param author commit author
     * @param grep grep commit message
     * @param limit max commits
     */
    logCommits(branch = "", file = "", author = "", grep = [], limit = 0) {
        let fileFlag = file.length > 0 ? `-- ${file}` : "";
        let limitFlag = limit > 0 ? `-${limit}` : "";
        let authorFlag = author.length > 0 ? `--author=${author}` : "";
        let grepFlag = grep.map(key => `--grep="${key}"`).join(" ");
        return this.run(`git log ${branch} --oneline ${limitFlag} ${authorFlag} ${grepFlag} ${fileFlag}`).then(results => {
            // let reg = new RegExp("^([a-z0-9]*) (\(.*\) )?(.*)$")
            return results.split('\n').filter(line => {
                return line.length > 0;
            }).map(line => {
                let parts = line.split(' ');
                if (parts.length == 0) {
                    return null;
                }
                let name = parts[0];
                parts.splice(0, 1);
                return {
                    commitId: name,
                    message: parts.join(' ')
                };
            }).filter(ret => {
                return ret != null;
            });
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
/**
 * 递归读取一个目录下的所有文件，返回文件路径组成的数组，同步方法
 */
function readDirRecursiveSync(dirpath) {
    let resultPaths = [];
    let dirpathStack = [dirpath];
    while (dirpathStack.length > 0) {
        let pathToDir = dirpathStack.pop();
        for (let file of fs.readdirSync(pathToDir)) {
            let fullpath = path.resolve(pathToDir, file);
            if (!fs.existsSync(fullpath)) {
                continue;
            }
            if (fs.statSync(fullpath).isDirectory()) {
                dirpathStack.push(fullpath);
            }
            else {
                resultPaths.push(fullpath);
            }
        }
    }
    return resultPaths;
}
exports.readDirRecursiveSync = readDirRecursiveSync;
//# sourceMappingURL=Base.js.map