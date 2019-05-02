const fs = require('fs')
const config = require('../help/config')

module.exports = () => {
    let index = 1
    config.templates().map(temp => {
        console.log(`${index}. ${temp.name}`)
        index++
    })
}