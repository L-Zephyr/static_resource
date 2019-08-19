import { Git } from "./utils";
import * as fs from "fs";
import * as path from "path"

interface Commit {
    commitId: string
    message: string
}

export class CherryPickerHelper {
    private commitsFile: string = ""
    private commits: Commit[] = []
    private index: number = 0
    private git: Git = new Git()

    /**
     * @param commitsFile 包含所有commit的文件，--oneline格式
     */
    constructor(commitsFile: string) {
        this.commitsFile = commitsFile
        let content = fs.readFileSync(path.resolve(commitsFile), { encoding: 'utf-8' })
        if (!content) {
            console.log(`read ${commitsFile} fail`)
            return
        }
        this.commits = content.split('\n').reduce((result, line) => { // filter commit
            let match = line.match(/(\w+) (.*)/)
            if (match) {
                result.push({
                    commitId: match[1],
                    message: match[2]
                }) 
            }
            return result
        }, [])
        this.index = this.commits.length - 1
    }

    run() {
        this.pickNextCommit().then(str => {
            this.saveResultToLocal()
            console.log(str)
        }).catch(err => {
            this.saveResultToLocal()
            console.log(err)
        })
    }

    pickNextCommit(): Promise<string> {
        return new Promise((resolve, reject) => {
            if (this.index >= 0) {
                let commit = this.commits[this.index--]
                this.git.cherryPick(commit.commitId).then(out => {
                    return this.pickNextCommit()
                }).catch(err => {
                    reject(`cherry-pick fail at commit: ${commit.commitId} ${commit.message}\nplease resolve confict and commit manually, then run again`)
                })
            } else {
                resolve('cherry-pick finish')
            }
        })
    }

    saveResultToLocal() {
        let content = this.commits.slice(0, this.index + 1).map(commit => {
            return `${commit.commitId} ${commit.message}`
        }).join('\n')
        
        fs.writeFileSync(this.commitsFile, content, { encoding: 'utf-8' })
    }
}