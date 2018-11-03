#! /usr/bin/env node

const readdir = require('recursive-readdir')
const fs = require('fs')
const command = require('commander')
const path = require('path')

command
    .option("-p, --path [value]", '工程路径')
    .option("-b, --bundle [value]", 'Bundle的名称')
    .option("-s, --swift-bundle [value", "Swift代码Bundle的名称")
    .option("-o, --oc-bundle [value]", "oc代码中Bundle的名称")
    .parse(process.argv)

function rewriteOCFile(file, bundle) {
    let findImageReg = /(?<=\[UIImage ).*(?=imageNamed)/g // 找到 [UIImage imageNamed] 这样的语句，加上 ne_ 前缀
    let addBundleReg = /(?<=\[UIImage ne_imageNamed.*[\]"])(?=\])/g // 为 [UIImage ne_ImageNamed..] 后面加上Bundle

    let content = fs.readFileSync(file, { encoding: 'utf-8' })
    content = content.replace(findImageReg, "ne_")
    content = content.replace(addBundleReg, ` bundleName:${bundle}`)

    fs.writeFileSync(file, content, { encoding: "utf-8" })
}

function rewriteSwiftFile(file, bundle) {
    let findImageReg = /(?<=UIImage)\(named:\s*/g // 找到 UIImage(named 这样的语句，替换成 UIImage.ne_imageNamed(
    let addBundleReg = /(?<=UIImage\.ne_imageNamed.*[\)"])(?=\))/g // 加上Bundle

    let content = fs.readFileSync(file, { encoding: 'utf-8' })
    content = content.replace(findImageReg, ".ne_imageNamed(")
    content = content.replace(addBundleReg, `, bundleName:${bundle}`)

    fs.writeFileSync(file, content, { encoding: 'utf-8' })
}

function run(path, bundle, swiftBundle, ocBundle) {
    readdir(path, function(err, files) {
        for (let file of files) {
            if (file.endsWith('.m') || file.endsWith('.mm')) {
                rewriteOCFile(file, ocBundle ? ocBundle : bundle)
            } else if (file.endsWith('.swift')) {
                rewriteSwiftFile(file, swiftBundle ? swiftBundle : bundle)
            }
        }
    })
}

run(command.path, command.bundle, command.swiftBundle, command.ocBundle)
