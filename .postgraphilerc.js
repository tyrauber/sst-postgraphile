require('dotenv').config({path: '.env.local'})

const options = {
  port: 3000,
  connection: process.env.DATABASE_URL,
  schema: ['public', process.env.SCHEMA],
  jwtSecret: process.env.JWT_SECRET,
  defaultRole: process.env.DEFAULT_ROLE,
  jwtTokenIdentifier: process.env.JWT_IDENTIFIER,
  watch: true,
  enhanceGraphiql: true,
  retryOnInitFail: true,
  dynamicJson: true,
  disableQueryLog: false,
  writeCache: "./postgraphile.cache",
  showErrorStack: true,
  cors: true
}

console.log({options})
module.exports = {
  options
};