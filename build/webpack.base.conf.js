const path = require('path')
const webpack = require('webpack')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const GenerateJsonPlugin = require('generate-json-webpack-plugin');

function resolve(dir) {
    return path.join(__dirname, '..', dir)
}

module.exports = {
    entry: {
        popup: resolve('src/main.popup.js'),
        inject: resolve('src/main.inject.js'),
        background: resolve('src/background.js')
    },
    output: {
        path: resolve('dist'),
        filename: '[name].js'
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                    loaders: {
                        'scss': 'vue-style-loader!css-loader!sass-loader',
                        'sass': 'vue-style-loader!css-loader!sass-loader?indentedSyntax'
                    }
                }
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                include: [
                    resolve('node_modules/react-native-storage'),
                    resolve('src'),
                    resolve('test')
                ]
            },
            {
                test: /\.(png|jpg|gif|svg)$/,
                loader: 'file-loader',
                options: {
                    name: '[name].[ext]?[hash]'
                }
            },
            {
                test: /\.json$/,
                loader: 'json-loader'
            },
            {
                test: /\.less$/,
                loader: 'style-loader!css-loader!less-loader'
            },
            {
                test: /\.css$/,
                loader: 'css-loader'
            },
            {
                test: /\.html$/,
                loader: 'html-loader'
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.vue', '.json'],
        alias: {
            'vue$': 'vue/dist/vue.esm.js',
            'src': resolve('src'),
            'assets': resolve('src/assets'),
            'components': resolve('src/components'),
            'style': resolve('src/style'),
        }
    },
    plugins: [
        new CleanWebpackPlugin(['dist/*.*'], {
            root: resolve('')
        }),
        new CopyWebpackPlugin([
            { from: resolve('src/assets/img'), to: resolve('dist/img') }
        ]),
        new GenerateJsonPlugin('manifest.json', require(resolve('src/manifest')).chrome),
        new webpack.BannerPlugin({
            banner:  require(resolve('src/manifest')).tampermonkey,
            raw: true,
            entryOnly: true,
            include: /inject\.js/
        })
    ]
}
