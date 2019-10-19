import { Git, BaseCommand, Commit, readCommitsFromFile } from "./Base";
import * as fs from "fs";

export class CherryPickerHelper extends BaseCommand {
    private commitsFile: string = ""
    private commits: Commit[] = []
    private end: number = 0
    private noCommit: boolean = false

    /**
     * @param commitsFile 包含所有commit的文件，--oneline格式
     */
    constructor(commitsFile: string, noCommit: boolean = false) {
        super()
        this.commitsFile = commitsFile
        this.commits = readCommitsFromFile(commitsFile)
        this.noCommit = noCommit
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
            this.git.cherryPick(commit.commitId, this.noCommit ? ['--no-commit'] : []).then(result => {
                resolve(`cherry-pick ${commit.commitId} ${commit.message}`)
            }).catch(err => {
                let errMsg = `${err}`
                if (errMsg.search('hint: ') != -1) {
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