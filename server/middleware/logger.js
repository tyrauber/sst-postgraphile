//******************************
// Logger Middleware
//******************************

const knex = require('../db')
const db = knex.client.config

const { Pool } = require('pg')
const pool = new Pool(db.connection)

/* Logger */

const kbSize = (s) => {
  return (encodeURI(s).split(/%..|./).length - 1)/1000;
}

const log = async (sub, host, status, method, type, url, query, rt, kb, message, ip, referrer) => {
  pool.connect((err, client, release) => {
    if (err) { return console.error('Error acquiring client', err.stack)}
    client.query(`INSERT INTO app.stats(sub, host, status, method, type, path, query, rt, kb, message, ip, ref) \n
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12);`, [sub, host, status, method, type, url, query, rt||0, kb||0, message, ip, referrer], (err, result) => {
      release()
      if (err) { 
        console.log(err, [sub, host, status, method, type, url, query, rt, kb, message, ip, referrer])
        return console.error('Error executing query', err.stack) }
    })
  })
}

const createLogger = async (app) => {
  app.use(async (x, n) => {
    await n();
    const rt = x.response.get('X-Response-Time');
    const kb = x.response.get('X-Response-Size');
    if (process.env.NODE_ENV != 'test'){
      log(x.subdomains, x.host, x.status, x.method, x.type, x.url, x.querystring, rt, kb, x.message, x.ip, x.request.headers.referrer);
      console.log(`${x.method} ${x.status} ${x.url} - ${rt}ms - ${kb}kb`);
    }
  })
  .use(async (x, n) => {
    const start = Date.now();
    await n();
    const kb = kbSize(x.response.body);
    const ms = Date.now() - start;
    x.set('X-Response-Time', ms);
    x.set('X-Response-Size', kb);
  });
}

exports.createLogger = createLogger
