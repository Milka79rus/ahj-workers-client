const WorkboxPlugin = require('workbox-webpack-plugin');
const { merge } = require('webpack-merge');
const common = require('./webpack.common');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = merge(common, {
  mode: 'production',
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({})],
  },

  plugins: [
    new WorkboxPlugin.GenerateSW({
      clientsClaim: true,
      skipWaiting: true,
      navigateFallbackDenylist: [/^\/api\//],
      runtimeCaching: [
        {
          urlPattern: new RegExp('https://ahj-workers-serve-milka79rus\\.amvera\\.io/api/news'),
          // Стратегия: сначала идём в сеть, если сети нет или 500 — берём из кэша
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-news-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24, // Хранить кэш 1 день
            },
          },
        },
      ],
    }),
  ],
});