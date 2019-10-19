import { BaseCommand, Commit, readCommitsFromFile } from "./Base";

export class CommitsCompare extends BaseCommand {
    private commitsFile1: string
    private commitsAtFile1: Commit[] = []

    private commitsFile2: string
    private commitsAtFile2: Commit[] = []

    constructor(commitsFile1: string, commitsFile2: string) {
        super()
        this.commitsFile1 = commitsFile1
        this.commitsFile2 = commitsFile2

        this.commitsAtFile1 = readCommitsFromFile(commitsFile1)
        this.commitsAtFile2 = readCommitsFromFile(commitsFile2)

        this.git.cwd = '/Users/lzephyr/Desktop/work/wechat'
    }
    
    run() {
        (async () => {
            let index = 0
            let count = Math.min(this.commitsAtFile1.length, this.commitsAtFile2.length)
            let mismatchCount = 0
            let filename1 = this.commitsFile1.split('/').pop()
            let filename2 = this.commitsFile2.split('/').pop()

            for (; index < count; ++index) {
                let commit1 = this.commitsAtFile1[index]
                let commit2 = this.commitsAtFile2[index]
                try {
                    await this.diffChangesBetween(commit1.commitId, commit2.commitId)
                } catch (msg) {
                    mismatchCount++
                    console.log(`There are difference between:\n${commit1.commitId} ${commit1.message} at ${filename1}\n${commit2.commitId} ${commit2.message} at ${filename2}\n${msg}\n`)
                }
            }

            console.log(`Total commit count: ${count}, Mismatch count: ${mismatchCount}`)
        })()
    }

    async diffChangesBetween(commitId1: string, commitId2: string) {
        const skipType: string = "pbxproj"

        let files1 = (await this.git.getChangeFilesAt(commitId1)).filter(name => {
            return name.length > 0 && !name.endsWith(skipType)
        })
        let files2 = (await this.git.getChangeFilesAt(commitId2)).filter(name => {
            return name.length > 0 && !name.endsWith(skipType)
        })
        // 1. check if files differ
        let differs = files1.filter(name => !files2.includes(name))
            .concat(files2.filter(name => !files1.includes(name)))
        if (differs.length > 0) {
            throw `Mismatch files:\n${differs.join('\n')}`
            return
        }
        // 2. check each file content
        let mismatches: string[] = []
        for (let file of files1) {
            let changeLines1 = this.getChangeLines(await this.git.show(commitId1, file))
            let changeLines2 = this.getChangeLines(await this.git.show(commitId2, file))

            let differs = changeLines1.filter(line => !changeLines2.includes(line))
                .concat(changeLines2.filter(line => !changeLines1.includes(line)))
            if (differs.length > 0) {
                mismatches.push(file)
                // mismatches.push(`Mismatch commit files:\n${mismatches.join('\n')}`)
            }
        }
        if (mismatches.length > 0) {
            throw `Mismatch commit files:\n${mismatches.join('\n')}`
        }
    }

    getChangeLines(message: string): string[] {
        let changeLines: string[] = []
        let reg = /^[+-].*$/mg
        let match: RegExpExecArray = null
        while ((match = reg.exec(message)) != null) {
            changeLines.push(match[0])
        }
        return changeLines
    }
}