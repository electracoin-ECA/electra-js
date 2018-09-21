const common = require('./webpack.common.js')
const merge = require('webpack-merge')
const path = require('path')
const webpack = require('webpack')

module.exports = merge(common, {
  // We don't want any automated minifaction here because it breaks the types-checking.
  // https://webpack.js.org/concepts/mode/#mode-none
  mode: 'none',
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
  ],
})
