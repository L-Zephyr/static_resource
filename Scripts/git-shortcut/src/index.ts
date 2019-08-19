#!/usr/bin/env node

import * as program from "commander";
import { UnmergeCommit } from "./UnmergeCommit";
import { LastWeekCommits } from "./LastWeekCommits";
import { CherryPickerHelper } from "./CherryPick";

program
    .command('unmerges <targetBranch>')
    .description('print all commits not merge to targetBranch')
    .action((targetBranch) => {
        let command = new UnmergeCommit(targetBranch)
        command.run()
    })

program
    .command('last-week-commits <author>')
    .description('print all commits made last week for specify author')
    .action((author) => {
        let command = new LastWeekCommits(author)
        command.run()
    })

program
    .command('cherry-pick <commitFile>')
    .description('print all commits made last week for specify author')
    .action((commitFile) => {
        let command = new CherryPickerHelper(commitFile)
        command.run()
    })

program
    .command('help')
    .description('print help info')
    .action(() => {
        program.help()
    })

program.parse(process.argv)