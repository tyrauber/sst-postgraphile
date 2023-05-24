require('dotenv').config({path: `${__dirname}/.env.local`})
const options = {
  port: 3000,
  connection: process.env.DATABASE_URL,
  schema: ['public', 'app'],
  jwtSecret: process.env.JWT_SECRET,
  defaultRole: process.env.DEFAULT_ROLE,
  jwtPgTypeIdentifier: process.env.JWT_IDENTIFIER,
  jwtTokenIdentifier: process.env.JWT_IDENTIFIER,
  graphiql: true,
  //watch: true,
  enhanceGraphiql: true,
  //retryOnInitFail: true,
  dynamicJson: true,
  cors: true
}
module.exports = {
  options
};