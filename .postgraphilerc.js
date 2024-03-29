try{
  require('dotenv').config({path: `${__dirname}/.env.local`})
} catch(e){}
const options = {
  port: 3000,
  connection: process.env.DATABASE_URL,
  schema: ['public', 'app'],
  jwtSecret: process.env.JWT_SECRET,
  defaultRole: process.env.DEFAULT_ROLE,
  jwtPgTypeIdentifier: process.env.JWT_IDENTIFIER,
  jwtTokenIdentifier: process.env.JWT_IDENTIFIER,
  graphiql: '/graphiql',
  enhanceGraphiql: true,
  dynamicJson: true,
  cors: true
}
module.exports = {
  options
};