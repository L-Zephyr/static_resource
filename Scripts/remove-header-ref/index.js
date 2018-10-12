const process = require('process')
const fs = require('fs')
const readdir = require('recursive-readdir')

/* 
输入两个参数 sourcePath 和 excludePath 
去掉 sourcePath 路劲中所有源文件对 excludePath 目录中头文件的import
*/

if (process.argv.length < 4) {
    console.log('Param required')
    process.exit()
}

// 参数1：工程目录
let sourcePath = process.argv[2]
// 参数2：需要排除的头文件的目录
let excludePath = process.argv[3]

readdir(excludePath, function (err, files) {
    // 需要排除的头文件
    let headers = files.filter(file => {
            return file.endsWith('.h')
        })
        .map(file => {
            return `#import "${file.split('/').reverse()[0]}"\n`
        })
        .join('|')
    // 匹配所有import的正则
    let reg = `(${headers})`

    // 遍历工程中的所有代码文件
    readdir(sourcePath, function (err, files) {
        for (let file of files) {
            if (!file.endsWith('.m') && !file.endsWith('.mm') && !file.endsWith('.h')) {
                continue
            }
            let content = fs.readFileSync(file, {
                encoding: 'utf-8'
            })
            let result = content.replace(new RegExp(reg), "")
            fs.writeFileSync(file, result, {
                encoding: 'utf-8'
            })
        }
    })
})