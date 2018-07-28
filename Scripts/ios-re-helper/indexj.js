const exec = require('child_process').execSync

if (process.argv.length < 3) {
    console.log('Please input executable file name')
    process.exit()
}
