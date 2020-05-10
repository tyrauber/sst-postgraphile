const handler = require('serverless-http');
const server = require('./server/index');

exports.handler = handler(server);