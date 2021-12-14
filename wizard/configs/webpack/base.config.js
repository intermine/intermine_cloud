const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')
const dotenv = require('dotenv')

const { entryPath, rootDir, envPath } = require('./paths')

dotenv.config({ path: envPath })

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
                test: /\.(png|jpe?g|gif|webp|svg)$/i,
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
        new webpack.DefinePlugin({
            'process.env': JSON.stringify(process.env)
        })
    ],
}
