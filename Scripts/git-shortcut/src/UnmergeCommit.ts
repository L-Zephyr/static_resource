import { runCommand } from "./Utils";

export class UnmergeCommit {
    private targetBranch: string

    constructor(targetBranch: string) {
        this.targetBranch = targetBranch
    }

    run() {
        runCommand('git log')
    }
}