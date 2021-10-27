const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')
const { entryPath, rootDir } = require('./paths')

module.exports = {
    entry: entryPath,
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
        mainFields: ['browser', 'main', 'module'],
    },

    module: {
        rules: [
            {
                test: /\.(js|jsx|tsx|ts)$/,
                use: 'babel-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.(png|jpe?g|gif|webp)$/i,
                use: [
                    {
                        loader: 'file-loader',
                    },
                ],
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                use: ['file-loader'],
            },
        ],
    },

    plugins: [
        new HtmlWebpackPlugin({
            template: path.join(rootDir, 'public', 'templates', 'index.html'),
            inject: 'body',
            filename: 'index.html',
            minify: true,
            publicPath: '/',
            title: 'Intermine Cloud',
            favicon: path.join(
                rootDir,
                'public',
                'templates',
                'intermine-logo.webp'
            ),
        }),
    ],
}
