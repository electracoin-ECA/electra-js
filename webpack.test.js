const common = require('./webpack.common.js')
const merge = require('webpack-merge')
const path = require('path')
const uglifyJsPlugin = require('uglifyjs-webpack-plugin')
const webpack = require('webpack')

module.exports = merge(common, {
  devtool: false,

  output: {
    filename: 'index.browser.js',
    library: 'ElectraJs',
    libraryTarget: 'var',
    path: path.resolve(__dirname, 'build'),
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"',
      'process.env.DEBUG_PROD': 'false',
    }),
    new uglifyJsPlugin({
      sourceMap: true,
    }),
  ],
})
