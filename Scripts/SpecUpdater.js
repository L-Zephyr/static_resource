#!/usr/bin/env node

const path = require('path')
const fs = require('fs')
const process = require('process')
const exec = require('child_process').execSync

const LocalProjectPath = ''
const LocalRepoPath = ''

/*
功能：
根据podspec中的版本号自动打上tag，在Repos中创建相应版本的文件夹将podspec拷贝过去并提交
spec根目录中必须有一个 .config.json 文件：
{
    "localRepoPath": "xxx" // 本地Repos仓库的位置
}
并将.config.json添加到.gitignore中

执行步骤：
1. 读取podspec文件中的版本号，并打上tag
2. 在Repos的本地仓库中创建一个相应版本的文件夹，并将该sepc拷贝到里面
3. 提交Repos到远程仓库

使用chmod 755 xxx为该文件提供执行权限
*/

// 将当前文件夹路径设置为工作路径
process.chdir(__dirname)

// 读取本地的配置文件
function readConfigFile() {
    let configPath = path.resolve('./.config.json')
    if (!fs.existsSync(configPath)) {
        throw "配置文件.config.json不存在"
    }
    let data = fs.readFileSync(configPath, {
        encoding: 'utf-8'
    })
    return JSON.parse(data)
}

// 在当前位置中找到.sepc文件
function getSpecFile(dir) {
    let list = fs.readdirSync(dir)
    for (let index in list) {
        let filename = path.join(dir, list[index])
        var stat = fs.statSync(filename)

        if (stat.isDirectory() && filename != ".git") {
            let result = getSpecFile(filename)
            if (result !== null) {
                return result
            }
        } else if (filename.endsWith(".podspec")) {
            return filename
        }
    }
    return null
}

/// 从一个spec文件中读取项目名称和版本信息: { name: xxx, version: xxx }
function getProjectInfo(podspec) {
    let content = fs.readFileSync(podspec, {
        encoding: 'utf-8'
    })
    let infos = [
        new RegExp("(?<=(s.name\\s*=\\s*'))\\w*(?=')"), // 匹配项目名
        new RegExp("(?<=(s.version\\s*=\\s*')).*(?=')") // 匹配版本号
    ].map(reg => {
        let result = content.match(reg)
        if (result && result.length > 0) {
            return result[0]
        }
        return null
    })

    if (infos[0] == null || infos[1] == null) {
        return null
    }

    return {
        name: infos[0],
        version: infos[1]
    }
}

// // 遍历文件夹
// function enumerateDir(dir, callback, recursive = false) {
//     if (!callback) {
//         return
//     }
//     let list = fs.readdirSync(dir)
//     for (let index in list) {
//         let filename = path.join(dir, list[index])
//         var stat = fs.statSync(filename)

//         if (stat.isDirectory() && filename != ".git" && recursive == true) {
//             enumerateDir(filename, callback, recursive)
//         } else {
//             callback(filename)
//         }
//     }
// }

// ------------------------------

// 从./.config.json中读取配置文件
try {
    var Config = readConfigFile()
    if (!Config.localRepoPath) {
        throw "localRepoPath not found"
    }
} catch (err) {
    console.log("Error: " + err)
    process.exit()
}

// 获取当前位置下的.podspec文件
let currentSpec = getSpecFile("./")
if (currentSpec == null) {
    console.log('.podspec not found in current path')
    process.exit()
}

let projectInfo = getProjectInfo(currentSpec) // 项目信息 { name: xxx, version: xxx }
if (projectInfo == null) {
    console.log('Project name and version not found')
    process.exit()
}

// repos中的目标文件夹
let targetFolder = path.join(Config.localRepoPath, projectInfo.name) 
if (!fs.existsSync(targetFolder)) {
    fs.mkdirSync(targetFolder)
}

// 在Repos中创建当前版本对应的文件夹
let targetPath = path.join(targetFolder, projectInfo.version) // repos/prjectName/1.0.0
if (fs.existsSync(targetPath)) {
    console.log(projectInfo.name + ' ' + projectInfo.version + ' already exists')
    process.exit()
} else {
    fs.mkdirSync(targetPath)
}

// ----- 1. local spec打上tag -----

let stdout = exec('git tag ' + projectInfo.version)
if (stdout.length != 0) {
    console.log('Tag error!')
    process.exit()
}
exec('git push origin ' + projectInfo.version)

// ----- 2. 将podspec文件拷贝到本地的Repos文件夹中（创建相应版本的文件夹）
fs.copyFileSync(currentSpec, path.join(targetPath, projectInfo.name + '.podspec')) // repos/prjectName/1.0.0/xxx.podspec

// ----- 3. 将Repos提交上去
let cwd = Config.localRepoPath
exec("git pull", {
    cwd: cwd
})
exec("git add .", {
    cwd: cwd
})
exec(`git commit -a -m "${projectInfo.name} ${projectInfo.version}"`, {
    cwd: cwd
})
exec("git push", {
    cwd: cwd
})