/* eslint-disable */

var webpack = require('webpack');
var path = require('path');
var SystemBellPlugin = require('system-bell-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

const isProd = process.env.NODE_ENV === 'production';

const entry = {
  app: isProd ? [
      './src/index.jsx'
    ] : [
      'webpack-dev-server/client?http://0.0.0.0:3030', // WebpackDevServer host and port
      'webpack/hot/only-dev-server', // "only" prevents reload on syntax errors
      './src/index.jsx'
    ],
  pub: './src/index-pub.jsx'
}

const jsLoaders = isProd ? ['babel-loader'] : ['react-hot', 'babel-loader'];

module.exports = {
  entry: entry,
  devtool: 'source-map',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: "[name].bundle.js",
    publicPath: '/assets/'
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loaders: jsLoaders
      },
      {
        test: /\.scss$/,
        loader: 'style-loader!css-loader!sass-loader'
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader'
      },
      {
        test: /\.(png|jpg)$/,
        loader: 'url-loader?limit=8192'
      },
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new SystemBellPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify(process.env.NODE_ENV),
        'LUMEN_KEYCLOAK_URL': JSON.stringify(process.env.LUMEN_KEYCLOAK_URL)
      }
    })
  ]
};
