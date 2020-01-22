import { BaseCommand, readDirRecursiveSync } from "./Base/Base";
import * as fs from 'fs'

export class Search extends BaseCommand {
    regex: string
    branch: string
    limit: number
    file: string

    constructor(regex: string, branch: string = "", limit: number = 0, file: string = "") {
        super()
        this.regex = regex
        this.branch = branch
        this.limit = limit
        this.file = file
    }

    run() {
        // this.git.logCommits(this.branch, this.file, this.limit).then(commits => {
        //     return Promise.all(
        //         commits.map(sha => {
                    
        //         })
        //     );
        // })
    }

    search(commits: string[]) {
        commits.map(sha => {
            this.git.show(sha).then(content => {
                this.searchChanges(content)
            })
        })
    }

    searchChanges(changeLog: string) {
        let changeLineRule = /^[+-].*/mg
        let matchRule = new RegExp(this.regex, 'mg')
        let match: RegExpExecArray = null

        let lines = changeLog.split('\n')
        
        while ((match = changeLineRule.exec(changeLog)) != null) { // 找到发生变更的行

        }
    }
}