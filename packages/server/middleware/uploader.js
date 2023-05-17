const _ = require('koa-route');
const jwt = require('jsonwebtoken');
const AWS = require('aws-sdk')

const knex = require('../db')
const db = knex.client.config

const { Pool } = require('pg')
const pool = new Pool(db.connection)

const signedUrlExpireSeconds = 60 * 100

const validate = async (ctx) => {
  return !!(ctx.request.url == '/api/upload')
}

const createUploader = async (app) => {

  /* JWT Auth Middleware
  * Extracts, parses and decodes authorization token and gets user aws details from db and adds them to the context.
  */

  /* 1) Parse JWT Token to extract user_id */
  app.use(async (ctx, n) => {
    if (validate(ctx) && !!(ctx.request.headers.authorization)){
      let token = ctx.request.headers.authorization.match(/BEARER (.*)/)[1]
      ctx.user = jwt.verify(token, process.env.APP_SECRET);
    }
    await n()
  })

  /* 2) Query DB for user AWS credentials */
  app.use(async (ctx, n) => {
    if(validate(ctx) && ctx.user && ctx.user.user_id) {
      const { rows } = await pool.query('SELECT aws_access_key_id, aws_secret_access_key, aws_bucket_name, aws_region_name FROM app.users WHERE id = $1 LIMIT 1;', [ctx.user.user_id])
      ctx.user = Object.assign(ctx.user, rows[0])
    }
    await n()
  })


  app.use(_.post('/api/upload', async (ctx, next) => {
    let body = ctx.request.body;
    if(ctx.user && ctx.user.aws_access_key_id && ctx.user.aws_secret_access_key && ctx.user.aws_bucket_name && ctx.user.aws_region_name){
      const s3 = new AWS.S3({
        signatureVersion: 'v4',
        accessKeyId: ctx.user.aws_access_key_id,
        secretAccessKey: ctx.user.aws_secret_access_key,
        region: ctx.user.aws_region_name
      })
      const key = `${ctx.user.user_id}${body.path}`;
      const options = {
        Bucket: ctx.user.aws_bucket_name,
        Key: key,
        Expires: signedUrlExpireSeconds,
        ContentType: body.type,
        ACL: 'public-read'
      }
      const url = s3.getSignedUrl('putObject', options)
      ctx.body = JSON.stringify({ url: url })
    } else {
      ctx.throw(400, 'Unable to authenticate')
    }
  }));
}

module.exports.createUploader = createUploader