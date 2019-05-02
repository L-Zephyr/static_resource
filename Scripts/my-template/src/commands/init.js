const config = require('../help/config')
const co = require('co')
const prompt = require('co-prompt')
const fs = require('fs-extra')
const path = require('path')
const execSync = require('child_process').execSync

/**
 * 选择模板
 * @param {string} templatePath 选中模板的路径
 * @param {string} name 自定义名称
 */
function* initTemplate(templatePath, name) {
    let targetPath = path.resolve(process.cwd(), name)
    let templateScript = path.resolve(targetPath, config.templateScript)
    
    // 1. 先将模板拷贝到当前目录
    fs.copySync(templatePath, targetPath)
    // 2. 替换项目名称
    let packageFile = path.resolve(targetPath, 'package.json')
    if (fs.existsSync(packageFile)) {
        let content = fs.readFileSync(packageFile, { encoding: 'utf-8' }).replace(/\<%template-name%\>/g, name)
        fs.writeFileSync(packageFile, content, { encoding: 'utf-8' })
    }
    // 3. 执行模板脚本
    if (fs.existsSync(templateScript)) {
        let action = require(templateScript)
        if (typeof action == 'function') {
            if (action.constructor.name == 'GeneratorFunction') {
                yield* action()
            } else {
                action()
            }
        }
    }
    // 4. 删除模板脚本
    fs.removeSync(templateScript)
    
    return targetPath
}

module.exports = () => {
    co(function *() {
        console.log('')
        let templates = config.templates()
        let index = 1
        templates.map(temp => {
            console.log(`${index}. ${temp.name}`)
            index++
        })
        console.log('')
        // 1. 选择模板
        let choose = yield prompt("Choose a template: ")
        if (choose < 1 || choose > templates.length) {
            console.log('Invalid selection')
            process.exit()
        } 
        let template = templates[choose - 1]
        // 2. 指定名称
        let name = yield prompt('Input your project name: ')
        // 3. 创建模板
        let targetPath = yield* initTemplate(template.path, name)
        // 4. npm install
        console.log('Running npm install')
        execSync('npm install', { cwd: targetPath })
    }).catch(err => {
        process.exit()
    }).finally(() => {
        process.exit()
    })
}
