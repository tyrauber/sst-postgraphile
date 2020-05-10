// ******************************
// Dependencies
// ******************************

const Dotenv = require('dotenv-webpack');
require('dotenv').config()
const Path = require('path')
const TerserJSPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader')
const Webpack = require('webpack')
const WebpackMerge = require('webpack-merge')
const WebpackNodeExternals = require('webpack-node-externals')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin')
const slsw = require('serverless-webpack');
// ******************************
// Convenience Utils
// ******************************

const env = process.env.NODE_ENV || 'development'
const isProduction = env === 'production'

// ******************************
// Base Webpack Configuration
// ******************************

const base = {
  target: 'node',
  optimization: {
    minimize: false
  },
  performance: {
    hints: false
  },
  devtool: 'nosources-source-map',
  externals: WebpackNodeExternals({
    whitelist: ['isomorphic-fetch', 'vue', 'vue-router', 'vuex', 'vue-meta']
  }),
  mode: isProduction ? 'production' : 'development',
  //mode: slsw.lib.webpack.isLocal ? 'development': 'production',
  entry: {
    //web: Path.resolve(__dirname, './app/config/entry-web.js'),
    //server: Path.resolve(__dirname, './app/config/entry-server.js'),
    handler: Path.resolve(__dirname, './handler.js'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [{
          loader: 'babel-loader'
        }],
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          isProduction ? MiniCssExtractPlugin.loader : 'vue-style-loader', // or MiniCssExtractPlugin.loader
          { loader: 'css-loader', options: { sourceMap: true, importLoaders: 1 } },
          { loader: 'sass-loader', options: { sourceMap: true } },
        ],
      },
      {
        test: /\.(eot|woff|woff2|ttf)(\?.*)?$/,
        loader: 'file-loader',
        options: {
          name: '[name].[hash:8].[ext]',
          outputPath: './fonts/',
          publicPath: '/dist/fonts/',
          esModule: false
        }
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'file-loader',
        options: {
          name: '[name].[hash:8].[ext]',
          outputPath: './images/',
          publicPath: '/dist/images/',
          esModule: false
        }
      },
    ]
  },
  output: {
    libraryTarget: 'commonjs2',
    path: Path.join(__dirname, './public'),
    publicPath: '/public/',
    filename: '[name].js',
    sourceMapFilename: '[file].map'
  },
  // output: {
  //   path: Path.resolve(__dirname, './public/dist'),
  //   publicPath: '/dist/',
  //   filename: "[name].[hash:8].js"
  // },
  plugins: [
    new VueLoaderPlugin(),
    new MiniCssExtractPlugin({
      filename: !isProduction ? '[name].css' : '[name].[hash:8].css',
      chunkFilename: !isProduction ? '[id].css' : '[id].[hash:8].css',
      path: Path.resolve(__dirname, './public/dist'),
      publicPath: '/public/dist'
    }),
  ],
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      "@": Path.resolve(__dirname, './app')
    },
    extensions: ['.js', '.vue']
  }
}

// // ****************************************
// // Client-Side Webpack Configuration
// // ****************************************

// const web = WebpackMerge(base, {
//   target: 'web',
//   devtool: isProduction ? false : 'source-map',
//   entry: ['@/config/entry-web.js'],
//   plugins: [
//     new VueSSRClientPlugin(),
//     new Dotenv()
//   ]
// })

// if (!isProduction) {
//   web.entry.unshift('webpack-hot-middleware/client?quiet=true&reload=true')
//   web.plugins.push(new Webpack.HotModuleReplacementPlugin())
//   web.plugins.push(new Webpack.NoEmitOnErrorsPlugin())
// }

// // ****************************************
// // Server-Side Webpack Configuration
// // ****************************************

// const server =  WebpackMerge(base, {
//   target: 'node',
//   entry: ["./app/config/entry-server.js"],
//   externals: WebpackNodeExternals({
//     whitelist: ['isomorphic-fetch', 'vue', 'vue-router', 'vuex', 'vue-meta']
//   }),
//   output: {
//     path: Path.resolve(__dirname, './public/dist'),
//     publicPath: '/public/dist',
//     libraryTarget: 'commonjs2'
//   },
//   plugins: [
//     //new CleanWebpackPlugin(),
//     new VueSSRServerPlugin(),
//     new Dotenv()
//   ]
// })

module.exports = base
