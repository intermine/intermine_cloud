const webpackMerge = require('webpack-merge').merge
const baseConfig = require('./base.config')

module.exports = webpackMerge(baseConfig, {
    devtool: 'eval-source-map',
    output: {
        publicPath: '/',
    },

    devServer: {
        open: true,
        historyApiFallback: {
            disableDotRule: true,
        },
        hot: true,
    },
})
