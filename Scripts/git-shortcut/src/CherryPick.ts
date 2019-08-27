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
    private end: number = 0
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
        this.end = this.commits.length
        this.commits.reverse()
    }

    run() {
        if (this.commits.length == 0) {
            return;
        }
        (async () => {
            try {
                for (let commit of this.commits) {
                    this.end--
                    let result = await this.cherryPickCommit(commit)
                    console.log(result)
                }
                console.log('cherry-pick finish')
                this.saveResultToLocal()
            } catch (e) {
                console.log(e)
                this.saveResultToLocal()
            }
        })()
    }

    cherryPickCommit(commit: Commit): Promise<string> {
        return new Promise((resolve, reject) => {
            this.git.cherryPick(commit.commitId).then(result => {
                resolve(`cherry-pick ${commit.commitId} ${commit.message}`)
            }).catch(err => {
                let errMsg = `${err}`
                if (errMsg.search('hint: after resolving the conflicts') != -1) {
                    reject(`cherry-pick fail at commit: ${commit.commitId} ${commit.message}\nplease resolve confict and commit manually, then run again`)
                } else {
                    resolve(`cherry-pick ${commit.commitId} ${commit.message}`)
                }
            })
        })
    }

    saveResultToLocal() {
        let content = this.commits.reverse().slice(0, this.end).map(commit => {
            return `${commit.commitId} ${commit.message}`
        }).join('\n')
        
        fs.writeFileSync(this.commitsFile, content, { encoding: 'utf-8' })
    }
}