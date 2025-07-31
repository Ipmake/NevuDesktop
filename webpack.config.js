const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (env, argv) => {
  const isDevelopment = argv.mode === 'development';

  return {
    entry: './src/index.tsx',
    target: 'electron-renderer',
    mode: argv.mode || 'development',
    devtool: isDevelopment ? 'inline-source-map' : false,
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: {
            loader: 'ts-loader',
            options: {
              configFile: 'tsconfig.webpack.json',
              transpileOnly: isDevelopment, // Faster builds in dev
            }
          },
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.(png|jpg|jpeg|gif|svg)$/,
          type: 'asset/resource',
          generator: {
            filename: '[name][ext]'
          }
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
      filename: 'renderer.js',
      path: path.resolve(__dirname, 'build/renderer'),
      clean: isDevelopment ? false : true, // Don't clean in dev for faster rebuilds
    },
    watchOptions: {
      ignored: /node_modules/,
      poll: 1000, // Check for changes every second
      aggregateTimeout: 300, // Delay the rebuild after the first change
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.join(__dirname, 'src', 'index.html'),
        filename: 'index.html',
        inject: 'body',
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, 'assets/icon.png'),
            to: path.resolve(__dirname, 'build/renderer/icon.png')
          },
          {
            from: path.resolve(__dirname, 'assets/logoBig.png'),
            to: path.resolve(__dirname, 'build/renderer/logoBig.png')
          }
        ]
      }),
    ],
    externals: {
      electron: 'commonjs2 electron',
    },
  };
};
