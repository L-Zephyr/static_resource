import { exec, execSync } from "child_process";
import * as fs from "fs";
import * as path from "path"

export interface Commit {
    commitId: string
    message: string
}

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

/**
 * read commits from file
 * @param file file the contains all commit list, with '--oneline' format
 * @param reversed retrun reversed commit list, defaults to true
 */
export function readCommitsFromFile(file: string, reversed: boolean = true): Commit[] {
    let content = fs.readFileSync(path.resolve(file), { encoding: 'utf-8' })
    if (!content) {
        return []
    }
    let commits = content.split('\n').reduce((result, line) => { // filter commit
        let match = line.match(/(\w+)[ \t]+(.*)/)
        if (match) {
            result.push({
                commitId: match[1],
                message: match[2]
            })
        }
        return result
    }, [])
    if (reversed) {
        commits.reverse()
    }
    return commits
}

export class Git {
    public cwd: string

    constructor(cwd: string = './') {
        this.cwd = cwd
    }

    /**
     * cherry pick a commit
     */
    cherryPick(commitId: string, args: string[] = []): Promise<string> {
        return runCommand(`git cherry-pick ${commitId} ${args.join(' ')}`, this.cwd)
    }

    show(commitId: string, file: string = "", args: string[] = []): Promise<string> {
        return runCommand(`git show ${commitId} ${args.join(' ')} -- ${file}`, this.cwd)
    }

    /**
     * return change files at specify commit
     */
    getChangeFilesAt(commitId: string): Promise<string[]> {
        return runCommand(`git show ${commitId} --name-only --oneline`, this.cwd).then(msg => {
            let lines = msg.split('\n')
            if (lines.length <= 1) {
                return []
            }
            return lines.slice(1) // remove first
        })
    }
}

export class BaseCommand {
    protected git: Git = new Git()

    run() {

    }
}