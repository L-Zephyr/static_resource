const request = require('request')
const rp = require('request-promise')
const process = require('process')
const cheerio = require('cheerio')
const tableParser = require('cheerio-tableparser')

/*
爬取官方文档上关于OC到Swift类型命名的映射关系
*/

// 数组去重
Object.defineProperty(Array.prototype, 'unique', {
    value: function () {
        return this.filter(function (item, index, array) {
            return array.indexOf(item) === index
        })
    }
})

// --------

// evolution-0086: 定义了NSFoundation在Swift中的命名
const target1 = "https://raw.githubusercontent.com/apple/swift-evolution/master/proposals/0086-drop-foundation-ns.md"
// 文档，包含了OC中的类型在Swift中的名字
const target2 = "https://developer.apple.com/documentation/swift/imported_c_and_objective_c_apis/working_with_foundation_types"

let mapping = []

rp(target1)
    .then(response => { // 抓取0086的文档
        let tables = response.match(/.*\|.*\|.*/g)

        // OC到swift类型名的映射，数组第一项为OC的名字，第二项为swift的名字
        let result = tables.map(list => { // 将匹配到的字符串按|分解成数组
            return list.split('|').slice(0, 2).map(name => name.trim())
        }).filter(pair => { // 过滤掉一些无效的记过
            if (pair[0].includes(' ') || pair[0].includes('-')) {
                return false
            }
            return true
        }).map(pair => { // 转换成swift的代码
            return `"${pair[0]}": "${pair[1]}"`
        })

        mapping = mapping.concat(result)
        return rp(target2)
    })
    .then(response => { // 抓取working_with_foundation_types文档
        $ = cheerio.load(response)
        tableParser($)
        let table = $('table').parsetable(true, true, true)
        if (!table) {
            console.log('working_with_foundation_types文档解析失败，可能是网页结构有变，请重新检查')
            process.exit(0)
        }

        let swiftList = table[0]
        let ocList = table[1]
        let result = []
        for (let index in swiftList) {
            if (!swiftList[index].includes(' ') && !ocList[index].includes(' ')) {
                result.push(`"${ocList[index].trim()}": "${swiftList[index].trim()}"`)
            }
        }

        // 生成swift代码
        let mapString = mapping.concat(result).unique().join(',\n')
        let code = `[\n${mapString}\n]`
        console.log(code)

        process.exit(0)
    })
    .catch(error => {
        console.log("Request Error: " + error)
        process.exit(0)
    })