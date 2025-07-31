const path = require('path');

module.exports = {
  entry: './src/webview-preload.ts',
  target: 'electron-preload',
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'webview-preload.js',
    path: path.resolve(__dirname, 'build'),
  },
  externals: {
    electron: 'commonjs2 electron',
  },
};
