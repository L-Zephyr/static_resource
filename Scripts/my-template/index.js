#! /usr/bin/env node

const program = require('commander')
const init = require('./src/commands/init')
const list = require('./src/commands/list')

// 1. 版本
program.version(require('./package').version) 

// 2. 展示所有可选模板
program
    .command('list')
    .alias('l')
    .description('show all templates')
    .action(() => {
        list()
    })

// 3. 创建一个模板
program
    .command('init')
    .alias('i')
    .description('create a new template')
    .action(() => {
        init()
    })

program.parse(process.argv)
