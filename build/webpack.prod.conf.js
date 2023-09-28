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
    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                uglifyOptions: {
                    compress: {
                        warnings: false
                    },
                    output: {
                        comments: /^ (@(?!see)\w+\s|=)/
                    }
                },
                sourceMap: false,
                parallel: true
            })
        ]
    },
    plugins: [
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
        }),
        new webpack.BannerPlugin({
            banner: require(resolve('src/manifest')).tampermonkey,
            raw: true,
            entryOnly: true,
            include: /inject\.js/
        })
    ]
})

