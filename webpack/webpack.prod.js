const { merge } = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const common = require('./webpack.common.js');

const prodConfig = {
  output: {
    publicPath: './'
  },
  mode: 'production',
  devtool: 'eval',
  plugins: [new MiniCssExtractPlugin({ filename: 'style/[name].[contenthash].css' })]
};
const config = merge(common, prodConfig);

module.exports = config;
