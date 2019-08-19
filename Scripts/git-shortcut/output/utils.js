"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
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
class Git {
    constructor(cwd = './') {
        this.cwd = cwd;
    }
    /**
     * cherry pick a commit
     */
    cherryPick(commitId) {
        return runCommand(`git cherry-pick ${commitId}`, this.cwd);
    }
}
exports.Git = Git;
//# sourceMappingURL=utils.js.map