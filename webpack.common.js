const webpackNodeExternals = require('webpack-node-externals')

module.exports = {
  target: 'node',

  entry: {
    app: './src/index.ts',
  },

  output: {
    filename: 'index.js',
    libraryTarget: 'commonjs2',
  },

  module: {
    loaders: [
      { test: /.*\.ts$/, loader: 'awesome-typescript-loader' },
    ],
  },

  resolve: {
    extensions: ['.ts', '.js', 'json'],
  },

  node: {
    console: false,
    global: true,
    process: true,
    __filename: false,
    __dirname: false,
    Buffer: true,
    setImmediate: true,
  },

  externals: [webpackNodeExternals()],
}
