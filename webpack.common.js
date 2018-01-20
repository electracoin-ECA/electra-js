module.exports = {
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
}
