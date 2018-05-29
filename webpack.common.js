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
    rules: [
      { test: /.*\.ts$/, user: 'awesome-typescript-loader' },
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

  externals: {
    child_process: 'child_process',
    fs: 'fs',
    net: 'net',
    os: 'os',
    path: 'path',
  },
}
