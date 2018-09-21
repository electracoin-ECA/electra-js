const CleanWebpackPlugin = require('clean-webpack-plugin')
const common = require('./webpack.common.js')
const merge = require('webpack-merge')
const path = require('path')
const webpack = require('webpack')

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',

  output: {
    path: path.resolve(__dirname, 'build'),
  },

  plugins: [
    new CleanWebpackPlugin(['build']),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"development"',
      'process.env.DEBUG_PROD': 'true',
    }),
  ],
})
