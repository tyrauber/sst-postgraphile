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

const env = process.env.NODE_ENV
const isProduction = env === 'production'

let publicPath = !!(isProduction && process.env.CDN && process.env.STAGE)
 ? `${process.env.CDN}/${process.env.STAGE}` : `/public/${process.env.STAGE}`

// ******************************
// Base Webpack Configuration
// ******************************

console.log("publicPath", publicPath)

const base = {
  mode: isProduction ? 'production' : 'development',
  module: {
    rules: [{
      test: /\.vue$/,
      loader: 'vue-loader'
    },
    {
        test: /\.(sa|sc|c)ss$/,
        use: isProduction ? [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: process.env.NODE_ENV === 'development',
            },
          },'css-loader','sass-loader',
        ]: [
          'vue-style-loader','css-loader','sass-loader',
       ],
    },
    {
      test: /\.(eot|woff|woff2|ttf)(\?.*)?$/,
      loader: 'file-loader',
      options: {
        name: '[name].[hash:8].[ext]',
        outputPath: './fonts/',
        publicPath: `${publicPath}/fonts/`,
        esModule: false
      }
    },
    {
      test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
      loader: 'file-loader',
      options: {
        name: '[name].[hash:8].[ext]',
        outputPath: './images/',
        publicPath: `${publicPath}/images/`,
        esModule: false
      }
    },
    ]
  },
  output: {
    path: Path.resolve(__dirname, './public/'),
    publicPath: `${publicPath}/`,
    filename: "[name].[hash:8].js"
  },
  plugins: [
    new VueLoaderPlugin(),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: !isProduction ? '[name].css' : '[name].[hash:8].css',
      chunkFilename: !isProduction ? '[id].css' : '[id].[hash:8].css',
      path: Path.resolve(__dirname, './public/'),
      publicPath: `${publicPath}/`
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

// ****************************************
// Client-Side Webpack Configuration
// ****************************************

const web = WebpackMerge(base, {
  target: 'web',
  devtool: isProduction ? false : 'source-map',
  entry: ['@/config/entry-web.js'],
  plugins: [
    new VueSSRClientPlugin(),
    new Dotenv()
  ]
})

if (!isProduction) {
  web.entry.unshift('webpack-hot-middleware/client?quiet=true&reload=true')
  web.plugins.push(new Webpack.HotModuleReplacementPlugin())
  web.plugins.push(new Webpack.NoEmitOnErrorsPlugin())
}

// ****************************************
// Server-Side Webpack Configuration
// ****************************************

const server =  WebpackMerge(base, {
  target: 'node',
  entry: ["./app/config/entry-server.js"],
  externals: WebpackNodeExternals({
    whitelist: ['isomorphic-fetch', 'vue', 'vue-router', 'vuex', 'vue-meta']
  }),
  output: {
    path: Path.resolve(__dirname, './public'),
    publicPath: `${publicPath}/public`,
    libraryTarget: 'commonjs2'
  },
  plugins: [
    new CleanWebpackPlugin(),
    new VueSSRServerPlugin(),
    new Dotenv(),
    new CopyPlugin([
      { from: 'app/templates' }
    ])
  ]
})

const serverless =  WebpackMerge(base, {
  target: 'node',
  entry: {
    handler: Path.resolve(__dirname, './handler.js'),
  },
  optimization: {
    minimize: false
  },
  performance: {
    hints: false
  },
  devtool: 'nosources-source-map',
  externals: WebpackNodeExternals(),
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [{
          loader: 'babel-loader'
        }],
      }
    ]
  },
  output: {
    libraryTarget: 'commonjs2',
    path: Path.join(__dirname, './.webpack'),
    filename: '[name].js',
    sourceMapFilename: '[file].map'
  },
  plugins: [
    new CopyPlugin([
      { from: './public/vue-ssr-client-manifest.json' },
      { from: './public/vue-ssr-server-bundle.json' },
      { from: './public/index.template.html' }
      //{ from: 'public', to: 'public' }
    ])
  ]
})

module.exports = [server, web, serverless]

