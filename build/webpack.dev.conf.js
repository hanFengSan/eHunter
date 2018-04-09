var path = require('path')
var webpack = require('webpack')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var merge = require('webpack-merge')
let baseWebpackConfig = require('./webpack.base.conf')

function resolve(dir) {
    return path.join(__dirname, '..', dir)
}

module.exports = merge(baseWebpackConfig, {
    watch: true,
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'popup.html',
            template: 'src/index.popup.html',
            inject: true,
            excludeChunks: ['inject']
        }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': '"development"'
        })
    ]
})
