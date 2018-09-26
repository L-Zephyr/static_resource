#! /usr/bin/env node

const process = require('process')
const fs = require('fs')
const readdir = require('recursive-readdir')
require('date-format-lite')

if (process.argv.length < 3) {
    console.log('Folder path required')
    process.exit()
}

// 参数1；输入文件路径
let path = process.argv[2]
if (!fs.statSync(path).isDirectory()) {
    console.log('Path is not a directory')
    process.exit()
}

// 参数2：输出头文件名称
let output = "genereated_header.h"
if (process.argv.length > 3) {
    output = process.argv[3]
}

let header = `//
//  ${output}
//  Pods
//
//  Created by LZephyr on ${(new Date()).format('YYYY/MM/DD')}.
//

`
readdir(path, function (err, files) {
    if (err) {
        console.log('Read file error')
        return
    }
    let imports = files.map(file => {
        if (file.endsWith('.h')) {
            let components = file.split('/')
            return `#import "${components[components.length - 1]}"\n`
        }
        return ""
    }).filter(content => {
        return content.length > 0
    }).join("")

    let code = `${header}${imports}`
    console.log(code)

    fs.writeFileSync(`./${output}`, code, {
        encoding: 'utf-8'
    })
})