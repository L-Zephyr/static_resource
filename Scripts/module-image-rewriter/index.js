#! /usr/bin/env node

const readdir = require('recursive-readdir')
const fs = require('fs')
const command = require('commander')
const path = require('path')

command
    .option("-p --path [value]", '工程路径')
    .option("-b --bundle [value]", 'Bundle的名称')
    .parse(process.argv)

// 工程路径
let inputPath = command.path
if (!inputPath) {
    // process.exit()
}

function rewriteOCFile(file) {
    let reg = /(?<=\[UIImage imageNamed:.*["\]])(?=\])/g
    let content = fs.readFileSync(file, { encoding: 'utf-8' })
}

function rewriteSwiftFile(file) {
    let swiftReg = /UIImage\(named:.*\)/g

}

function run(path) {
    readdir(path, function(err, files) {
        files.map(file => {
            if (file.endsWith('.m')) {
                rewriteOCFile(file)
            } else if (file.endsWith('.swift')) {
                rewriteSwiftFile(file)
            }
        })
    })
}

/**
 * 递归遍历所有文件和文件夹
 * @param {string} filePath 文件路径
 * @param {} callback 回调，file：当前文件，isDir：是否为文件夹
 */
function recursiveReadSync(filePath, callback) {
    let files = fs.readdirSync(filePath)
    for (let file of files) {
        let fullPath = path.join(filePath, file)
        if (fs.statSync(fullPath).isDirectory()) {
            callback(fullPath, true)
            recursiveReadSync(fullPath, callback)
        } else {
            callback(fullPath, false)
        }
    }
}

run(inputPath)
