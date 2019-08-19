import { exec, execSync } from "child_process";

export function runCommand(cmd: string, cwd: string = './'): Promise<string> {
    return new Promise((resolve, reject) => {
        exec(cmd, { cwd: cwd }, (err, stdout, stderr) => {
            if (err || stderr) {
                reject(err ? err : stderr)
                return
            }
            resolve(stdout)
        })
    })
}

export class Git {
    private cwd: string

    constructor(cwd: string = './') {
        this.cwd = cwd
    }
    
    /**
     * cherry pick a commit
     */
    cherryPick(commitId: string): Promise<string> {
        return runCommand(`git cherry-pick ${commitId}`, this.cwd)
    }
}