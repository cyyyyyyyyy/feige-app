const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const baseConfig = {
  name: 'maocai',
  entry: path.resolve(__dirname, '../src/index'),
  output: {
    publicPath: '/',
    path: path.resolve(__dirname, '../dist')
  },
  resolve: {
    modules: ['node_modules', 'src'],
    extensions: ['.ts', '.tsx', '.jsx', '.js', '.less', '.css']
  },

  module: {
    rules: [
      {
        test: /\.(ts|js)x?$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.(css|less)$/,
        include: [/node_module/],
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          {
            loader: 'css-loader'
          },
          {
            loader: 'less-loader',
            options: {
              lessOptions: {
                javascriptEnabled: true
              }
            }
          }
        ]
      },
      {
        test: /\.(css|less)$/,
        exclude: [/node_module/],
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: true,
              reloadAll: true
            }
          },
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              sourceMap: true,
              modules: {
                localIdentName: '[path][name]__[local]'
              }
            }
          },
          {
            loader: 'less-loader',
            options: {
              lessOptions: {
                javascriptEnabled: true
              }
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      NODE_ENV: 'development',
      __static: `"${path.join(__dirname, '../static').replace(/\\/g, '\\\\')}"`
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../index.html')
    })
  ]
};

module.exports = baseConfig;
