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

    /**
     * specify commit id and file name, show change lines
     */
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

    /**
     * 查看指定文件某一行的最后修改人
     */
    blame(file: string, line: number): Promise<string> {
        return runCommand(`git blame -L ${line},${line} ${file}`, this.cwd).then(info => {
            let match = info.match(/^.* \((.*?) .*\)/)
            if (match && match[1]) {
                return match[1]
            }
            return ""
        }).catch(err => {
            return ""
        })
    }

    /**
     * blamed的同步版本
     */
    blameSync(file: string, line: number): string {
        try {
            let output = execSync(`git blame -L ${line},${line} ${file}`, { cwd: this.cwd, encoding: 'utf8' })
            let match = output.match(/^.* \((.*?) .*\)/)
            if (match && match[1]) {
                return match[1]
            }
        } catch {
            return ""
        }
        return ""
    }
}

export class BaseCommand {
    protected git: Git = new Git()

    run() {

    }
}

/**
 * 递归读取一个目录下的所有文件，返回文件路径组成的数组，同步方法
 */
export function readDirRecursiveSync(dirpath: string): string[] {
    let resultPaths: string[] = []
    let dirpathStack: string[] = [dirpath]
    
    while (dirpathStack.length > 0) {
        let pathToDir = dirpathStack.pop()
        for (let file of fs.readdirSync(pathToDir)) {
            let fullpath = path.resolve(pathToDir, file)
            if (!fs.existsSync(fullpath)) {
                continue
            }
            if (fs.statSync(fullpath).isDirectory()) {
                dirpathStack.push(fullpath)
            } else {
                resultPaths.push(fullpath)
            }
        }
    }

    return resultPaths
}