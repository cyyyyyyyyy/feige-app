const path = require('path');
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const common = require('./webpack.common.js');

const devConfig = {
  mode: 'development',
  devtool: 'source-map',
  devServer: {
    contentBase: path.join(__dirname, './dist'),
    compress: true,
    hot: true,
    port: 9001
  },
  plugins: [new MiniCssExtractPlugin({ filename: 'style/[name].css' })]
};

const config = merge(common, devConfig);

module.exports = config;
