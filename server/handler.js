const handler = require('serverless-http');
const server = require('./index');

exports.handler = handler(server);