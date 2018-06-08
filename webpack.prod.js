const CleanWebpackPlugin = require('clean-webpack-plugin');
const common = require('./webpack.common.js')
const merge = require('webpack-merge')
const path = require('path')
const webpack = require('webpack')

module.exports = merge(common, {
  // We don't want any automated minifaction here because it breaks the types-checking.
  // https://webpack.js.org/concepts/mode/#mode-none
  mode: 'none',
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
  ],
})
