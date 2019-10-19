#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const program = require("commander");
const UnmergeCommit_1 = require("./UnmergeCommit");
const LastWeekCommits_1 = require("./LastWeekCommits");
const CherryPick_1 = require("./CherryPick");
const CommitsCompare_1 = require("./CommitsCompare");
const MyTodo_1 = require("./MyTodo");
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
    .option('--nocommit')
    .description('print all commits made last week for specify author')
    .action((commitFile, cmdObj) => {
    let command = new CherryPick_1.CherryPickerHelper(commitFile, cmdObj.nocommit ? true : false);
    command.run();
});
program
    .command('compare-commits <commitsFile1> <commitsFile2>')
    .description("input two files that contains commits with '--one-line' format, compare the differences between two commits")
    .action((commitsFile1, commitsFile2) => {
    let command = new CommitsCompare_1.CommitsCompare(commitsFile1, commitsFile2);
    command.run();
});
program
    .command('my-todo <author>')
    .description('find `TODO:` in project that belongs to <author>')
    .action((author) => {
    let command = new MyTodo_1.MyTodo(author);
    command.run();
});
program
    .command('help')
    .description('print help info')
    .action(() => {
    program.help();
});
program.parse(process.argv);
//# sourceMappingURL=index.js.map