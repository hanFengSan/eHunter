const webpack = require('webpack')
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')

const webpackConfig = merge(baseWebpackConfig, {
    mode: 'development',
    // use inline sourcemap for karma-sourcemap-loader
    devtool: '#inline-source-map'
});
// no need for app entry during tests
delete webpackConfig.entry;
module.exports = webpackConfig;
