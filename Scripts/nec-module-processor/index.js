#! /usr/bin/env node

/*
处理工程中的所有xib文件，匹配指定的类型并替换它的Module
*/

const process = require('process')
const fs = require('fs')
const readdir = require('recursive-readdir')
const xml2js = require('xml2js')

if (process.argv.length < 3) {
    console.log('Folder path required')
    process.exit()
}

// 参数1；输入工程目录路径
let path = process.argv[2]

// NECUI中用swift实现的UI类型
let targets = ["AnimatedFavoriteView", "AnimatedLikeView", "AudioStatusBar", "AppCommentView", "CommonTextView", "DeerGirlDialog", "FanGiftTipView", "LoginActivityView", "PastboardComicView", "UpdatedComicCollectionCell", "UpdatedComicsView", "NEAlertView", "SingleButtonTipView", "NEButton", "NEImageView", "NELabel", "NESwitch", "NETextField", "NETextView", "NEView"]

// 遍历每一个节点带有属性的节点
const recursiveMatch = (xmlObj, callback) => {
    for (let key in xmlObj) {
        let obj = xmlObj[key]
        if (typeof (obj) == 'object') {
            if (obj["$"] !== undefined) {
                callback(obj)
            }
            recursiveMatch(obj, callback)
        }
    }
    return xmlObj
}

readdir(path, function (err, files) {
    if (err) {
        console.log('Read file error ' + err)
        process.exit()
    }
    let xibs = files.filter(file => {
        let components = file.split('.')
        return components.length > 0 && components[components.length - 1] == 'xib'
    }).map(file => {
        return file
    })

    for (let key in xibs) {
        let file = xibs[key]
        let content = fs.readFileSync(file, {
            encoding: 'utf-8'
        })
        // 解析xib
        xml2js.parseString(content, function (err, result) {
            if (err) {
                console.log(err)
                return
            }
            let found = false
            let xmlObj = recursiveMatch(result, function (obj) {
                let cls = obj.$["customClass"]
                if (cls && targets.indexOf(cls) != -1) {
                    found = true
                    obj.$["customModule"] = "NECatoonReader" // 替换模块
                    delete obj.$["customModuleProvider"] // 删除inherit from target
                }
            })
            if (found) {
                let xml = (new xml2js.Builder()).buildObject(result)
                fs.writeFileSync(file, xml, {
                    encoding: 'utf-8'
                })
            }
        })
    }
})

// readdir('/Users/lzephyr/Desktop/NECFoundation/NECFoundation/Classes/NECTools', function (err, files) {
//     let result = files.filter(file => {
//         return file.split('.').reverse()[0] == 'swift'
//     }).map(file => {
//         return file.split('/').reverse()[0].split('.')[0]
//     }).map(name => {
//         return `"${name}"`
//     }).join(', ')
//     console.log(result)
// })