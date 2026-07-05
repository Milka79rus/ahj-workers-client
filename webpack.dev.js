const WorkboxPlugin = require('workbox-webpack-plugin');
const path = require('path');
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const common = require('./webpack.common');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    historyApiFallback: true,
    open: true,
    compress: true,
    port: 8080,
  },

  plugins: [
    new WorkboxPlugin.GenerateSW({
      clientsClaim: true,
      skipWaiting: true,
      navigateFallbackDenylist: [/^\/api\//],
    }),
  ],
});
