const fs = require('fs')
const xml2js = require('xml2js')
const command = require('commander')

command
    .option("--xib [value]", "XIB的路径")
    .parse(process.argv)

/**
 * 在xml对象中搜索指定节点
 * @param {any} xml xml对象
 * @param {function(string, any):boolean} filter
 * @returns {{name: string, obj: nay}[]} 过滤出来的xml对象 
 */
function filter(xml, filter) {
    /**
     * @param {any[]} result 
     * @param {any} xmlObj xml节点
     */
    let recursiveSearch = (result, xmlObj, parentName) => {
        for (let name in xmlObj) {
            let child = xmlObj[name]
            if (typeof (child) != 'object' || name == '$') {
                continue
            }
            
            if (filter(name, child)) {
                result.push({
                    'name': parentName ? parentName : name,
                    'obj': child
                })
            }
            if (Array.isArray(child)) {
                result = recursiveSearch(result, child, name)
            } else {
                result = recursiveSearch(result, child)
            }
            
        }
        return result
    }
    return recursiveSearch([], xml)
}

/**
 * 将xib中的类型名转换成代码中的类型名
 * @param {string} name xib中的名字
 * @param {any} obj xml对象
 * @returns {string} 
 */
function nameMapping(name, obj) {
    let customClass = obj.$['customClass']
    if (customClass) {
        return customClass
    }
    return 'UI' + name.slice(0, 1).toUpperCase() + name.slice(1)
}

/**
 * @type { {name: string, obj: any, property: string}[] }
 */
let targets = []

let content = fs.readFileSync(command.xib, { encoding: 'utf-8' })
xml2js.parseString(content, {compact: false}, function (err, xml) {
    if (err) {
        return
    }
    
    let nodes = filter(xml, (name, xmlObj) => {
        return name == 'outlet'
    })
    for (let outlets of Array.from(nodes)) {
        for (let outlet of Array.from(outlets.obj)) {
            let property = outlet.$['property']
            let found = filter(xml, (name, obj) => {
                if (!obj.$) {
                    return false
                }
                return obj.$['id'] == outlet.$['destination']
            })
            if (found.length == 0) {
                console.log('not found');
            } else {
                let target = found[0]
                target.property = property
                targets.push(target)
            }
        }
    }
})

let code = targets.map(node => {
    return {
        'name': node.property,
        'type': nameMapping(node.name, node.obj)
    }
}).map(prop => {
    return `@property (weak, nonatomic) IBOutlet ${prop.type} *${prop.name};`
}).join('\n')

console.log(code);
