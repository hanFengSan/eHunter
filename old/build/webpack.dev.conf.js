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
    mode: 'development',
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'popup.html',
            template: 'src/legacy/index.popup.html',
            inject: true,
            chunks: ['popup']
        }),
        new webpack.BannerPlugin({
            banner: require(resolve('src/manifest')).tampermonkey,
            raw: true,
            entryOnly: true,
            include: /inject\.js/
        })
    ]
})
