"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Base_1 = require("./Base/Base");
const fs = require("fs");
class MyTodo extends Base_1.BaseCommand {
    constructor(author) {
        super();
        this.author = author;
    }
    run() {
        let files = Base_1.readDirRecursiveSync('./');
        for (let file of files) {
            if (!file.endsWith('.mm') && !file.endsWith('.h') && !file.endsWith('.m')) {
                continue;
            }
            let fileContent = fs.readFileSync(file, { encoding: 'utf-8' });
            let lines = fileContent.split('\n');
            let reg = /[Tt][Oo][Dd][Oo][:：]/; // 找到`TODO:`标记，忽略大小写和中英文符号
            for (let idx = 0; idx < lines.length; ++idx) {
                let match = lines[idx].match(reg);
                if (match) {
                    let author = this.git.blame(file, idx + 1).then(author => {
                        if (author.length > 0 && author.toLowerCase().search(this.author.toLowerCase()) != -1) {
                            console.log(`${file} : col ${idx + 1}`);
                        }
                    });
                }
            }
        }
    }
}
exports.MyTodo = MyTodo;
//# sourceMappingURL=MyTodo.js.map