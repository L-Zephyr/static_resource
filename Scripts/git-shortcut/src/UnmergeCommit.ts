import { runCommand, BaseCommand, Commit } from "./Base/Base";

const trunk = "trunk"
const br_trunk = "br_trunk"
const author = "zephyrlv"

export class UnmergeCommit extends BaseCommand {
    grep: string[] = []
    branch: string = br_trunk

    constructor(branch: string = br_trunk, grep: string) {
        super()
        if (grep && grep.length > 0) {
            this.grep = [grep]
        }
        if (branch && branch.length > 0) {
            this.branch = branch
        }
    }

    run() {
        this.git.logCommits(trunk, "", author, this.grep).then(trunkCommits => {
            return this.git.logCommits(this.branch, "", author, this.grep).then(brCommits => {
                this.compare(trunkCommits, brCommits)
            })
        }).catch(err => {
            console.log(err)
        })
    }

    compare(trunkCommits: Commit[], brCommits: Commit[]) {
        let reg = new RegExp("^[a-z0-9]* (\(.*\) )?(.*)")
        let trunkMsgSet = new Set<string>()
        
        for (let commit of trunkCommits) {
            trunkMsgSet.add(commit.message)
        }

        for (let commit of brCommits) {
            if (!trunkMsgSet.has(commit.message)) {
                console.log(`unmerge commit in ${this.branch}: ${commit.commitId} ${commit.message}`)
            }
        }
    }
}