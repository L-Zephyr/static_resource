#! /usr/bin/env node

const process = require('process')
const fs = require('fs')
const md5 = require('md5')
const path = require('path')
const exec = require('child_process').execSync

/*
自动将指定目录下的markdown文件中的所有本地图片上传到github中，并将markdown中的本地路径替换成远程的url
*/

const LocalRepository = '/Users/lzephyr/Desktop/code/github/static_resource/' // 本地仓库的位置
const ImagesFoler = 'Resources' // 仓库中存放资源的文件夹
const RemoteBaseUrl = 'https://raw.githubusercontent.com/L-Zephyr/static_resource/master/' // 远程仓库的URL

// 处理一个markdown文件
function processMarkdown(markdownPath) {
    console.log("--------------------------------------------")
    console.log("Process markdown file: " + markdownPath + ":")

    let markdownBaseName = path.basename(markdownPath).split('.')[0]
    if (!fs.existsSync(markdownPath)) {
        console.log(markdownPath + ' not exists!')
        process.exit()
    }

    let imagesReg = /(?<=!\[.*\]\().+?(?=\))/g // 匹配所有的图片链接
    let fileContent = fs.readFileSync(markdownPath, {
        encoding: 'utf-8'
    })

    // 获取目标文件夹
    let targetFolder = path.join(LocalRepository, ImagesFoler, markdownBaseName)
    if (!fs.existsSync(targetFolder)) {
        try {
            fs.mkdirSync(targetFolder)
        } catch (error) {
            console.log('create ' + targetFolder + ' failed: ' + error)
            process.exit()
        }
    }

    // 获得原始的图片名和转换后的图片名
    let localImages = fileContent.match(imagesReg)
    if (!localImages) {
        console.log("No image found!")
        process.exit()
    }
    let remoteImages = localImages.map(image => {
        if (image.startsWith('http://') || image.startsWith('https://') || !fs.existsSync(image)) {
            return image
        }

        let filepath = path.resolve(image)
        let ext = path.extname(filepath)
        let filename = md5(filepath) + ext
        fs.copyFileSync(image, path.join(targetFolder, filename))

        // return path.join(RemoteBaseUrl, ImagesFoler, filename)
        return RemoteBaseUrl + ImagesFoler + '/' + markdownBaseName + '/' + filename
    })

    // 上传github
    let option = {
        cwd: LocalRepository
    }
    try {
        if (exec('git status -uall -s', option).toString().length > 0) { // 有更改
            exec('git pull', option)
            exec('git add .', option)
            exec('git commit -a -m "Update resource"', option)
            exec('git push', option)
        }
    } catch (error) {
        console.log('Upload github error: ' + error)
        process.exit()
    }

    // 上传成功后替换图片
    for (let index in localImages) {
        let localImage = localImages[index]
        let remoteImage = remoteImages[index]

        console.log(remoteImage)
        fileContent = fileContent.replace(new RegExp(`${localImage}`, 'g'), remoteImage)
    }

    // 写入文件
    try {
        fs.writeFileSync(markdownPath, fileContent, {
            encoding: 'utf-8'
        })
    } catch (error) {
        console.log(error)
    }
}

// 获取参数
if (process.argv.length < 3) {
    console.log('Markdown file path required!')
    process.exit()
}

let filePath = process.argv[2]
if (fs.statSync(filePath).isDirectory()) { // 如果是一个文件夹则查找所有markdown文件
    for (let file of fs.readdirSync(filePath)) {
        if (path.extname(file) == ".md") {
            processMarkdown(path.resolve(filePath, file))
        }
    }
} else { // 否则只处理这一个
    processMarkdown(filePath)
}