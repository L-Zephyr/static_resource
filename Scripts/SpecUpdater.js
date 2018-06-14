const path = require('path')
const fs = require('fs')
const process = require('process')
const commander = require('commander')

const LocalProjectPath = ''
const LocalRepoPath = ''

/*
1. 指定一个版本号和commit信息， 使用方式: SpecUpdater -v 1.0.0 -m "commit message"

2. 提交当前仓库的变更，并打上tag
3. 在Repos的本地仓库中创建一个相应版本的文件夹，并将该sepc拷贝到里面
4. 提交Repos到远程仓库
*/

// 读取本地的配置文件
function readConfigFile() {
    let path = './.config.json'
    if (!fs.existsSync(path)) {
        throw "配置文件.config.json不存在"
    }
    let data = fs.readFileSync(path, { encoding: 'utf-8' })
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
    let content = fs.readFileSync(podspec, { encoding: 'utf-8' })
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

// 遍历文件夹
function enumerateDir(dir, callback, recursive = false) {
    if (!callback) {
        return
    }
    let list = fs.readdirSync(dir)
    for (let index in list) {
        let filename = path.join(dir, list[index])
        var stat = fs.statSync(filename)

        if (stat.isDirectory() && filename != ".git" && recursive == true) {
            enumerateDir(filename, callback, recursive)
        } else {
            callback(filename)
        }
    }
}

// ------------------------------

// 解析命令行参数
commander
    .version('0.1.0', '-v, --version')
    .option('-t, --tag <n>', 'Set a new tag for current spec', (val) => String(val))
    .option('-m, --message <n>', 'The message you commit the spec', (val) => String(val))
    .parse(process.argv)

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

let projectInfo = getProjectInfo(currentSpec) // 项目信息
let targetFolder = null // 目标文件夹
if (projectInfo == null) {
    console.log('Project name and version not found')
    process.exit()
}

// 找到Repos中的目标文件夹
let list = fs.readdirSync(Config.localRepoPath)
for (let index in list) {
    let filename = list[index]
    let stat = fs.statSync(filename)
    if (stat.isDirectory() && filename == projectInfo.name) {
        targetFolder = path.join(Config.localRepoPath, filename)
        break
    }
}
if (targetFolder === null) {
    console.log(projectInfo.name + ' not found in Repos ' + Config.localRepoPath)
    process.exit()
}

// 在Repos中创建当前版本对应的文件夹
let targetPath = path.join(targetFolder, projectInfo.version) // repos/prjectName/1.0.0
if (fs.existsSync(targetPath)) {
    console.log(projectInfo.name + ' ' + projectInfo.version + ' already exists')
    process.exit()
} else {
    fs.mkdirSync(targetPath)
}

// 将podspec文件拷贝过去
fs.copyFileSync(currentSpec, path.join(targetPath, projectInfo.name + '.podspec')) // repos/prjectName/1.0.0/xxx.podspec
