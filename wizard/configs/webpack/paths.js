const path = require('path')

const rootDir = path.resolve(__dirname, '..', '..')
const entryPath = path.resolve(rootDir, 'src', 'index')
const distPath = path.resolve(rootDir, 'dist')

module.exports = {
    rootDir,
    entryPath,
    distPath,
}