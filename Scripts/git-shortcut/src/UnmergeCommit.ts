import { runCommand } from "./Base";

export class UnmergeCommit {
    private targetBranch: string

    constructor(targetBranch: string) {
        this.targetBranch = targetBranch
    }

    run() {
        runCommand('git log')
    }
}