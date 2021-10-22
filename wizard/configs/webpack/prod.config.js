const TerserPlugin = require('terser-webpack-plugin')
const webpackMerge = require('webpack-merge').merge
const baseConfig = require('./base.config')
const distPath = require('./paths').distPath

module.exports = webpackMerge(baseConfig, {
    output: {
        path: distPath,
        filename: '[name].bundle.[chunkhash].js',
    },
    plugins: [new TerserPlugin()],
})
