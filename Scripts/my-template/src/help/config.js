const os = require('os')
const path = require('path')
const fs = require('fs')

const templateDir = path.resolve(os.homedir(), '.my-template')

/**
 * @returns { {name: string, path: string}[] } 所有模板的名称和全路径
 */
function templates() {
    return fs.readdirSync(templateDir)
        .filter(name => {
            if (!fs.statSync(path.resolve(templateDir, name)).isDirectory()) {
                return false
            }
            if (name.startsWith('.')) {
                return false
            }
            return true
        })
        .map(name => {
            return {
                name: name,
                path: path.resolve(templateDir, name)
            }
        })
}

module.exports = {
    templates: templates, // 获取所有模板信息
    templateScript: "template-script.js" // 模板脚本名称
}