const Webpack = require('webpack')
const config = require('./webpack.config.js')
const webCompiler = Webpack(config.shift(), (err, stats) => {})
const serverCompiler = Webpack(config.shift(), (err, stats) => {})
module.exports = config.pop()