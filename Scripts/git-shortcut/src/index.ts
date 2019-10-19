#!/usr/bin/env node

import * as program from "commander";
import { UnmergeCommit } from "./UnmergeCommit";
import { LastWeekCommits } from "./LastWeekCommits";
import { CherryPickerHelper } from "./CherryPick";
import { CommitsCompare } from "./CommitsCompare";
import { MyTodo } from "./MyTodo";

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
    .option('--nocommit')
    .description('print all commits made last week for specify author')
    .action((commitFile, cmdObj) => {
        let command = new CherryPickerHelper(commitFile, cmdObj.nocommit ? true : false)
        command.run()
    })

program
    .command('compare-commits <commitsFile1> <commitsFile2>')
    .description("input two files that contains commits with '--one-line' format, compare the differences between two commits")
    .action((commitsFile1, commitsFile2) => {
        let command = new CommitsCompare(commitsFile1, commitsFile2)
        command.run()
    })

program
    .command('my-todo <author>')
    .description('find `TODO:` in project that belongs to <author>')
    .action((author) => {
        let command = new MyTodo(author)
        command.run()
    })

program
    .command('help')
    .description('print help info')
    .action(() => {
        program.help()
    })

program.parse(process.argv)