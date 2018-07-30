#! /usr/bin/env node

const exec = require('child_process').execSync
const fs = require('fs-extra')
const plist = require('plist')

if (process.argv.length < 3) {
    console.log('Please input executable file name')
    process.exit()
}
process.chdir(__dirname)

let execFile = process.argv[2]

function removeIfExist(path) {
    if (fs.existsSync(path)) {
        fs.removeSync(path)
    }
}

// 1. class-dump
console.log('1. Running class-dump...')
let headers = './Headers'
removeIfExist(headers)
exec(`class-dump --arch armv7 ${execFile} -A -H -o ${headers}`)

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