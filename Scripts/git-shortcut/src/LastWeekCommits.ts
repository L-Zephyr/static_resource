import { BaseCommand } from "./Base/Base";

export class LastWeekCommits extends BaseCommand {
    private author: string

    constructor(author: string) {
        super()
        this.author = author
    }

    run() {
        
    }
}