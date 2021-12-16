const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')
const dotenv = require('dotenv')
const { RetryChunkLoadPlugin } = require('webpack-retry-chunk-load-plugin')

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
            'process.env': JSON.stringify(process.env),
        }),
        new RetryChunkLoadPlugin({
            // optional stringified function to get the cache busting query string appended to the script src
            // if not set will default to appending the string `?cache-bust=true`
            cacheBust: `function() {
                return Date.now();
            }`,
            // optional value to set the amount of time in milliseconds before trying to load the chunk again. Default is 0
            retryDelay: 5000,
            // optional value to set the maximum number of retries to load the chunk. Default is 1
            maxRetries: 500,
            // TODO: ADD LAST RESORT SCRIPT. NEED TO CREATE A PAGE FOR LAST RESORT.
            lastResortScript: `window.location.href='/'`
        }),
    ],
}
