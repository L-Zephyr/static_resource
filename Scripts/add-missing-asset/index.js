#! /usr/bin/env node

const fs = require('fs-extra')
const path = require('path')
var command = require('commander')
const readdir = require('recursive-readdir')

command
    .option("--main-path [value]", "主工程的路径")
    .option("--module-path [value]", "组件的路径")
    .option("--module-asset [value]", "组件的Asset路径")
    .parse(process.argv)
/**
 * 递归遍历文件夹
 * @param  {string} dir 路径
 * @param  {} callback 回调，只会回调文件夹类型
 */
function recursiveReadDirs(dir, callback) {
    let files = fs.readdirSync(dir)
    for (let file of files) {
        let full = path.join(dir, file)
        if (fs.statSync(full).isDirectory()) {
            callback(full)
            recursiveReadDirs(full, callback)
        }
    }
}

/**
 * 查找所有的xcasset文件夹，返回所有图片信息数据
 * @param  {string} path 工程路径
 * @returns {object} 一个字典，key：图片名，value：全路径
 */
function getAssetItems(path) {
    let infos = {}
    recursiveReadDirs(path, function (dir) {
        if (dir.endsWith('.imageset')) {
            let name = dir.split('/').reverse()[0].split('.')[0]
            infos[name] = dir
        }
    })
    return infos
}

function run(mainPath, modulePath, assetPath) {
    let mainAssetInfos = getAssetItems(mainPath)
    let moduleAssetInfos = getAssetItems(modulePath)

    readdir(modulePath, function (err, files) {
        let ocReg = /(?<=\[UIImage imageNamed:\s*@").*(?="\])/g
        let swiftReg = /(?<=UIImage\(named:\s*").*(?="\))/g
        let xibReg = /(?<=image name=").*?(?=")/g

        for (let file of files) {
            let reg
            if (file.endsWith('.m') || file.endsWith('.mm')) { // OC 文件
                reg = ocReg
            } else if (file.endsWith('.swift')) { // Swift文件
                reg = swiftReg
            } else if (file.endsWith(".xib") || file.endsWith(".storyboard")) {
                reg = xibReg
            } else {
                continue
            }

            let content = fs.readFileSync(file, { encoding: 'utf-8' })
            let names = content.match(reg) // 引用的资源名称
            if (!names) {
                continue
            }

            for (let name of names) {
                // 如果引用的图片不在组件的Asset中，而在主工程的Asset中，则移动到模块的Asset中
                if (!moduleAssetInfos.hasOwnProperty(name) && mainAssetInfos.hasOwnProperty(name)) { 
                    let tatget = path.join(assetPath, name + '.imageset')
                    fs.copySync(mainAssetInfos[name], tatget)
                }
            }
        }
    })
}

run(command.mainPath, command.modulePath, command.moduleAsset)