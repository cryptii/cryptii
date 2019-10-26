import EnvUtil from './EnvUtil'

const _cache = {}

export default class ResourceLoader {
    static async loadJson(fileName) {
        if (_cache.hasOwnProperty(fileName)) {
            return _cache[fileName]
        }

        let result

        if (EnvUtil.isNode()) {
            const util = require('util')
            const fs = require('fs')
            const readFile = util.promisify(fs.readFile)
            result = JSON.parse(await readFile(`${__dirname}/../resources/${fileName}`))
        } else {
            result = await (await fetch(`resources/${fileName}`)).json()
        }

        _cache[fileName] = result
        return result
    }
}
