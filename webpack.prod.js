const CleanWebpackPlugin = require('clean-webpack-plugin');
const common = require('./webpack.common.js')
const merge = require('webpack-merge')
const path = require('path')
const uglifyJsPlugin = require('uglifyjs-webpack-plugin')
const webpack = require('webpack')

module.exports = merge(common, {
  devtool: 'source-map',

  output: {
    path: path.resolve(__dirname, 'dist'),
  },

  plugins: [
    new CleanWebpackPlugin(['dist']),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"',
      'process.env.DEBUG_PROD': 'false',
    }),
    new uglifyJsPlugin({
      sourceMap: true,
    }),
  ],
})
