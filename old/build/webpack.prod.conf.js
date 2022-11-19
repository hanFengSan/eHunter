const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

function resolve(dir) {
    return path.join(__dirname, '..', dir)
}

module.exports = merge(baseWebpackConfig, {
    mode: 'production',
    plugins: [
        new UglifyJsPlugin({
            uglifyOptions: {
                compress: {
                    warnings: false
                }
            },
            sourceMap: false,
            parallel: true
        }),
        new HtmlWebpackPlugin({
            filename: 'popup.html',
            template: 'src/legacy/index.popup.html',
            inject: true,
            chunks: ['popup'],
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeAttributeQuotes: true
            }
        })
        // new webpack.BannerPlugin({
        //     banner: require(resolve('src/manifest')).tampermonkey,
        //     raw: false,
        //     entryOnly: true,
        //     include: /inject\.js/
        // })
    ]
})

