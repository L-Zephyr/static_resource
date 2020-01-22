#!/usr/bin/env node

import * as program from "commander";
import { UnmergeCommit } from "./UnmergeCommit";
import { LastWeekCommits } from "./LastWeekCommits";
import { CherryPickerHelper } from "./CherryPick";
import { CommitsCompare } from "./CommitsCompare";
import { MyTodo } from "./MyTodo";

program
    .command('unmerge')
    .option('--grep <type>', 'filter option')
    .description('print all commits not merge to targetBranch')
    .action((option) => {
        let command = new UnmergeCommit("br_trunk", option.grep)
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

// 在工程中找到指定作者的"TODO:"
program
    .command('my-todo <author>')
    .description('find `TODO:` in project that belongs to <author>')
    .action((author) => {
        let command = new MyTodo(author)
        command.run()
    })

// 从commit历史中的所有修改记录中匹配regex，输出产生这个修改的commit和author
program
    .command('search <regex>')
    .option('-b, --branch <type>', '在指定的分支中查找，默认为当前分支')
    .option('--limit', "最多匹配指定数量的提交，默认无限制")
    .option('--file', "在指定文件的修改中查找，默认为所有文件")
    .description('find which commit make changes that match the regex')
    .action((regex, cmdObj) => {
        console.log(regex + " " + cmdObj.branch)
    })

program
    .command('help')
    .description('print help info')
    .action(() => {
        program.help()
    })

program.parse(process.argv)