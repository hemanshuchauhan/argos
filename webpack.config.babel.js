/* eslint-disable import/no-extraneous-dependencies */
import webpack from 'webpack'
import AssetsPlugin from 'assets-webpack-plugin'
import path from 'path'
import config from './src/config'

const prod = process.env.NODE_ENV === 'production'
module.exports = {
  mode: prod ? 'production' : 'development',
  entry: './src/review/main.js',
  output: {
    path: path.join(__dirname, './server/static/review'),
    filename: prod ? '[name]-bundle-[chunkhash:8].js' : '[name].js',
    publicPath: '/static/review/',
  },
  resolve: {
    alias: {
      raven: 'raven-js',
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules\/(?!material-ui)/,
      },
      {
        test: /\.json$/,
        use: 'json-loader',
      },
      {
        test: /\.woff$/,
        use: 'url-loader?limit=100000',
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/,
        use: 'file-loader', // Hash name by default
      },
      {
        test: /\.svg$/,
        loader: 'image-webpack-loader',
        query: {
          svgo: {
            plugins: [
              {
                convertPathData: {
                  floatPrecision: 2,
                },
              },
            ],
          },
        },
      },
      {
        test: /\.html$/,
        loader: 'html-loader',
      },
      {
        test: /\.md$/,
        loader: 'raw-loader',
      },
    ],
  },
  plugins: [
    ...(prod
      ? [
          new AssetsPlugin({
            filename: './server/static/review/assets.json',
            prettyPrint: true,
          }),
        ]
      : []),
    new webpack.EnvironmentPlugin({
      PLATFORM: 'browser',
    }),
  ],
  devServer: {
    historyApiFallback: true,
    port: config.get('client.port'),
    disableHostCheck: true, // For security checks, no need here.
    // webpack-dev-middleware options.
    stats: {
      // Remove built modules information.
      modules: false,
      // Remove built modules information to chunk information.
      chunkModules: false,
      colors: true,
    },
    proxy: {
      '**': {
        target: {
          host: 'www.dev.argos-ci.com',
          protocol: 'http:',
          port: config.get('server.port'),
        },
        changeOrigin: true,
        secure: false,
      },
    },
  },
}
