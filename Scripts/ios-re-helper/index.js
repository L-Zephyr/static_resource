#! /usr/bin/env node

const exec = require('child_process').execSync
const fs = require('fs-extra')
const plist = require('plist')

// 使用方式：$ ios-re-helper path [arch]
// path - 可执行文件的位置； arch - 可选，可执行文件的架构，默认为32位的armv7

if (process.argv.length < 3) {
    console.log('Please input executable file name')
    process.exit()
}
process.chdir(__dirname)

console.log("啦啦啦 " + process.cwd())

let execFile = process.argv[2]
let arch = 'armv7'
if (process.argv.length > 3) {
    arch = process.argv[3]
}

function removeIfExist(path) {
    if (fs.existsSync(path)) {
        fs.removeSync(path)
    }
}

// 1. class-dump
console.log('1. Running class-dump...')
let headers = './Headers'
removeIfExist(headers)
fs.mkdir(headers)
exec(`class-dump --arch ${arch} ${execFile} -A -H -o ${headers}`)

// 2. 符号还原
console.log('2. Running restore-symbol...')
let symbolExecFile = `${execFile}_symbol`
removeIfExist(symbolExecFile)
exec(`restore-symbol ${execFile} -o ${symbolExecFile}`)

// 3. 添加调试权限，设置get-task-allow
console.log('3. Adding get-task-allow flag...')
let authXml = `${execFile}.xml`
exec(`ldid -e ${symbolExecFile} >> ${authXml}`) // 导出权限定义文件

// 添加字段
let json = plist.parse(fs.readFileSync(authXml, 'utf-8'))
json['get-task-allow'] = true
fs.writeFileSync(authXml, plist.build(json), 'utf-8')

// 4. 重签名
console.log('4. Resigning...')
exec(`ldid -S${authXml} ./${symbolExecFile}`)

// 5. 原始的可执行文件重命名为xx_original，最终的可执行文件保存为原有的名称
console.log('5. Renaming...')
fs.renameSync(execFile, `${execFile}_original`)
fs.renameSync(symbolExecFile, execFile)

console.log('Success!')