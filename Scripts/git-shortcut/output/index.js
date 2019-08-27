#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const program = require("commander");
const UnmergeCommit_1 = require("./UnmergeCommit");
const LastWeekCommits_1 = require("./LastWeekCommits");
const CherryPick_1 = require("./CherryPick");
program
    .command('unmerges <targetBranch>')
    .description('print all commits not merge to targetBranch')
    .action((targetBranch) => {
    let command = new UnmergeCommit_1.UnmergeCommit(targetBranch);
    command.run();
});
program
    .command('last-week-commits <author>')
    .description('print all commits made last week for specify author')
    .action((author) => {
    let command = new LastWeekCommits_1.LastWeekCommits(author);
    command.run();
});
program
    .command('cherry-pick <commitFile>')
    .description('print all commits made last week for specify author')
    .action((commitFile) => {
    let command = new CherryPick_1.CherryPickerHelper(commitFile);
    command.run();
});
program
    .command('help')
    .description('print help info')
    .action(() => {
    program.help();
});
program.parse(process.argv);
function test(index) {
    return new Promise((resolve, reject) => {
        console.log(`run ${index}`);
        if (index == 5) {
            reject(index);
        }
        else {
            resolve(index);
        }
    });
}
//# sourceMappingURL=index.js.map